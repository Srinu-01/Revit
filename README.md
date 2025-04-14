<h1 align="center">
    revit
  <br>
</h1>

<h4 align="center">A high-performance utility for performing reverse DNS lookups with CLI and Web interfaces</h4>

<p align="center">
  <a href="#install">🏗️ Install</a>
  <a href="#features">✨ Features</a>
  <a href="#cli-usage">🖥️ CLI Usage</a>
  <a href="#web-interface">🌐 Web Interface</a>
  <a href="#examples">🔍 Examples</a>
  <a href="#contributing">👥 Contributing</a>
  <br>
</p>

![revit](https://github.com/devanshbatham/revit/blob/main/static/revit.png?raw=true)

# Install
To install revit, run the following command:

```sh
go install github.com/revit/cmd/revit@latest```
```
Alternatively, you can clone the repository and build it yourself:
Alternatively, you can clone the repository and build it yourself:
```sh
```shlone https://github.com/devanshbatham/revit.git
git clone https://github.com/revit/revit.git
cd revit -o revit ./cmd/revit
go build -o revit ./cmd/revit
```
# Features
# Features
- 🚀 **Fast and Concurrent**: Perform multiple DNS lookups simultaneously
- 🚀 **Fast and Concurrent**: Perform multiple DNS lookups simultaneouslypiped input
- 🔄 **Flexible Input**: Accept IP addresses via command line, files, or piped input
- 🎯 **Custom Resolvers**: Use specific DNS resolvers for lookupscolor-coded output
- 🎨 **Color Output**: Easily distinguish IPs and hostnames with color-coded output
- 🔧 **Configurable**: Adjust concurrency levels to match your requirements
- 🌐 **Dual Interface**: Use either command-line or web interface based on your needs# Usage

# CLI UsageRevit offers multiple ways to perform reverse DNS lookups on IP addresses:

Revit's command-line interface offers multiple ways to perform reverse DNS lookups on IP addresses:## Command-Line Options

## Command-Line Options| Flag        | Description                                                        | Example                    |

| Flag        | Description                                                        | Example                    |
|-------------|--------------------------------------------------------------------|----------------------------|
| `-i`        | Specify a single target IP address for reverse DNS lookup.         | `revit -i 8.8.8.8`         |
| `-l`        | Provide the path to a file containing a list of IP addresses.      | `revit -l ip_list.txt`     |
| `-c`        | Set the level of concurrency for DNS lookups (default: 10).        | `revit -c 20`              |
| `-r`        | Specify resolvers for reverse DNS lookup.                          | `revit -r 8.8.8.8`         |
|             | You can provide a single IP address or a path to a file.           | `revit -r resolvers.txt`   |## Examples

# Web Interface### Look up a single IP address:

Revit also provides a web interface built with Fiber, allowing you to perform reverse DNS lookups through your browser. -i "8.8.8.8"

## Starting the Web Server
### Look up a list of IP addresses from a file:
To start the web interface, use:
 -l ip_list.txt
```sh
revit serve
```### Use a specific DNS resolver:

By default, the web server runs on port 8080. You can access it at http://localhost:8080. -i "8.8.8.8" -r "1.1.1.1"

## Web Interface Features
### Use multiple DNS resolvers from a file:
- User-friendly form for inputting IP addresses
- Bulk lookup capability -l ip_list.txt -r resolvers.txt
- Interactive results display
- Easy to use for those who prefer GUI over CLI
### Increase concurrency for faster lookups:
# Examples
 -l ip_list.txt -c 50
## CLI Examples

### Look up a single IP address:### Pipe input from another command:
```sh
revit -i "8.8.8.8""8.8.8.8" | revit
```

### Look up a list of IP addresses from a file:```sh
```shp_list.txt | revit
revit -l ip_list.txt
```
## Output Format
### Use a specific DNS resolver:
```shThe output is formatted with colored text for better readability:
revit -i "8.8.8.8" -r "1.1.1.1"
``````
.8.8        [dns.google]
### Use multiple DNS resolvers from a file:.one]
```sh
revit -l ip_list.txt -r resolvers.txt
```# Inspiration

### Increase concurrency for faster lookups:**revit** was born out of curiosity and a desire to explore Golang. While there are existing tools like [hakrevdns](https://github.com/hakluke/hakrevdns) that perform similar tasks (and I have immense respect for them), I decided to create this utility as a personal project to further my understanding of Go and enhance my programming skills.
```sh
revit -l ip_list.txt -c 50The development of **revit** started as an exploration into concurrent programming and networking in Go. As I tinkered with the language's features and learned more about its capabilities, the utility began to take shape.
```
# Contributing
### Pipe input from another command:
```shContributions are welcome! Feel free to submit pull requests or open issues if you have suggestions for improvements.
echo "8.8.8.8" | revit
```# License

```shThis project is licensed under the MIT License - see the LICENSE file for details.
cat ip_list.txt | revit```

## Output Format

The CLI output is formatted with colored text for better readability:

```
8.8.8.8        [dns.google]
1.1.1.1        [one.one.one.one]
```

# Technical Overview

Revit is built in Go using:
- Concurrent processing with goroutines
- Fiber framework for web interface
- HTML templating for web views
- Color formatting for CLI output

The application architecture separates core reverse DNS functionality from interface concerns, making it easy to extend and maintain.

# Contributing

Contributions are welcome! Feel free to submit pull requests or open issues if you have suggestions for improvements.

# License

This project is licensed under the MIT License - see the LICENSE file for details.
