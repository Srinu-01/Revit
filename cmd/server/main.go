package main

import (
	"log"
	"os"
	"strings"
	"sync"

	"github.com/devanshbatham/revit/internal/revit"
	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	html "github.com/gofiber/template/html/v2"
)

func main() {
	// Setup HTML templating engine
	engine := html.New("./web/views", ".html")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		Views: engine,
	})

	// Use middlewares
	app.Use(logger.New())
	app.Use(cors.New())

	// Serve static files
	app.Static("/", "./web/public")

	// Routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{
			"Title": "Revit - Reverse DNS Lookup Tool",
		})
	})

	// API endpoints
	api := app.Group("/api")

	// Single IP lookup
	api.Post("/lookup", func(c *fiber.Ctx) error {
		type request struct {
			IP        string   `json:"ip"`
			Resolvers []string `json:"resolvers"`
		}

		var req request
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		results := make(chan revit.LookupResult)
		sem := make(chan struct{}, 1) // Single request, so concurrency of 1

		go func() {
			selectedResolver := ""
			if len(req.Resolvers) > 0 {
				selectedResolver = req.Resolvers[0]
			}
			revit.LookupAddr(req.IP, results, sem, selectedResolver)
			close(results)
		}()

		// Wait for the result
		result := <-results

		if result.Error != nil && result.Error.Error() == "no such host" {
			return c.JSON(fiber.Map{
				"ip":       result.IPAddress,
				"dnsNames": []string{},
				"error":    "No such host",
			})
		}

		// Clean up DNS names (remove trailing dots)
		cleanNames := make([]string, 0, len(result.DNSNames))
		for _, name := range result.DNSNames {
			cleanNames = append(cleanNames, strings.TrimSuffix(name, "."))
		}

		return c.JSON(fiber.Map{
			"ip":       result.IPAddress,
			"dnsNames": cleanNames,
			"error":    nil,
		})
	})

	// Batch IP lookup
	api.Post("/batch-lookup", func(c *fiber.Ctx) error {
		type request struct {
			IPs         []string `json:"ips"`
			Resolvers   []string `json:"resolvers"`
			Concurrency int      `json:"concurrency"`
		}

		var req request
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		// Use default concurrency if not specified or invalid
		if req.Concurrency <= 0 {
			req.Concurrency = 10
		}

		results := make(chan revit.LookupResult)
		sem := make(chan struct{}, req.Concurrency)
		var wg sync.WaitGroup

		// Process each IP
		for _, ip := range req.IPs {
			wg.Add(1)
			go func(ipAddress string) {
				defer wg.Done()

				selectedResolver := ""
				if len(req.Resolvers) > 0 {
					// In a real implementation, you might want to pick randomly
					selectedResolver = req.Resolvers[0]
				}

				revit.LookupAddr(ipAddress, results, sem, selectedResolver)
			}(ip)
		}

		// Close results channel when all lookups are done
		go func() {
			wg.Wait()
			close(results)
		}()

		// Collect all results
		batchResults := make([]map[string]interface{}, 0)
		for result := range results {
			if result.Error != nil && result.Error.Error() == "no such host" {
				batchResults = append(batchResults, map[string]interface{}{
					"ip":       result.IPAddress,
					"dnsNames": []string{},
					"error":    "No such host",
				})
				continue
			}

			// Clean up DNS names (remove trailing dots)
			cleanNames := make([]string, 0, len(result.DNSNames))
			for _, name := range result.DNSNames {
				cleanNames = append(cleanNames, strings.TrimSuffix(name, "."))
			}

			batchResults = append(batchResults, map[string]interface{}{
				"ip":       result.IPAddress,
				"dnsNames": cleanNames,
				"error":    nil,
			})
		}

		return c.JSON(fiber.Map{
			"results": batchResults,
		})
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Start server
	log.Println("Starting Revit web server on port", port)
	log.Fatal(app.Listen(":" + port))
}
