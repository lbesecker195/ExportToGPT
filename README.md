# ExportToGPT.js

`ExportToGPT.js` is a utility designed to streamline the process of using ChatGPT for programming, development, and debugging. It simplifies the task of identifying and copying relevant project files and their directory structures, making it easy to paste them into ChatGPT (and other LLM based) prompts.

Great for software development using ChatGPT as well as using ChatGPT to debug!

Simply:
1) `exporttogpt "./project" "/desired/file"`
2) Copy the generated SYSTEM prompt.
3) Paste the SYSTEM prompt into your favorite LLM.
4) Enter your development/debugging related instructions in the USER prompt.
5) ???
6) Profit!

## Key Features

- **Framework Detection:** Automatically detects popular JavaScript frameworks (Express.js, React, Vue.js, Angular, Koa.js, NestJS) and includes relevant files.
- **Dependency Resolution:** Analyzes `require`, `import`, and `include` statements to identify and include dependent files.
- **Excludes Unrelated Files:** Filters out non-code resources such as images and stylesheets, focusing on code files and templates.
- **Enhanced Context for ChatGPT:** Prints the specified input file both at the start and end if there are more than 5 total files, ensuring better context retention for ChatGPT.

## Installation

To install `ExportToGPT.js` globally, run:

```bash
npm install -g exporttogpt
```

## Usage

To use the tool, run:

```bash
exporttogpt <project_directory> <filename>
```

### Example Input

**Current Directory:**

```bash
exporttogpt "./" "src/index.js"
```

**Absolute Directory:**

```bash
exporttogpt "/path/to/project" "src/index.js"
```

## Example Output

```
SYSTEM:
You are a Senior Node.js Software Engineer. Please use the following directory structure and provided project files to respond about the 'src/index.js' file.

Directory Structure:
{
  "src": {
    "index.js": "file",
     ...
    },
    ...
  },
  ...
}

File: /path/to/project/src/index.js
----------------------
...file contents...
----------------------

File: /path/to/project/src/components/App.js
----------------------
...file contents...
----------------------
...

```

If there are more than 5 files, the specified input file is printed at both the start and the end to enhance context retention for LLM based prompts like ChatGPT.

## Troubleshooting

#### Common Issues

1. **File Not Found**:
   - Ensure the specified file path is correct and exists within the project directory.
   
2. **Framework Not Detected**:
   - Double-check if the `package.json` contains the relevant dependencies for the supported frameworks.

## How It Enhances ChatGPT Usage

`ExportToGPT.js` makes it easier to provide ChatGPT with the context it needs to assist in development and debugging. By structuring and filtering relevant files, you can ensure that ChatGPT has the necessary information to provide accurate and helpful responses.

### Enhanced Context Management

With its ability to print the specified input file at both the start and the end of the output when there are more than 5 files, `ExportToGPT.js` ensures that important context is retained, improving the quality of assistance provided by ChatGPT.

### Supports Various Frameworks

The tool supports a range of popular JavaScript frameworks, making it versatile for many types of projects:

- **Express.js**: Includes routes, controllers, models, and views.
- **React**: Includes components, hooks, Redux files, and excludes non-relevant resources like CSS.
- **Vue.js**: Includes components, store modules, mixins, and templates.
- **Angular**: Includes components, services, stores, and templates.

## Contributing

Contributions are welcome! If you have any issues or feature requests, feel free to open an issue or submit a pull request on our [GitHub repository](https://github.com/yourusername/ExportToGPT.js).

### Steps to Contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Implement your changes.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

I'm not affiliated with OpenAI or ChatGPT.
