# LogViz

## Description

This project is a Node.js application that processes and validates logs, constructs a function call tree, and generates a visual representation of the tree using Mermaid.

## Pre-requisites
- mermaid-cli to be installed in the machine
```bash
npm install -g @mermaid-js/mermaid-cli 
```

## Installation

To install the necessary dependencies, run the following command:

```bash
git clone https://github.com/sishir2001/logViz.git
cd logViz/
npm install
```

## Usage

To run the application, use the following command in the project directory:

```bash
npm dev
```

## Features
 - Log Processing: The application reads logs from a JSON file, validates the function calls, and constructs a function call tree.
 - Mermaid Visualization: The application converts the function call tree into a Mermaid diagram and generates an SVG image of the diagram.
 -  Error Handling: The application handles errors gracefully and provides meaningful error messages.

## Outcome 
- logs are converted to a function hierarchial tree and mermaid is used to generate the following visualization 
- [functionTree](https://github.com/sishir2001/logViz/blob/master/generated/iter0/functionTree.md)

## Contributing
Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.