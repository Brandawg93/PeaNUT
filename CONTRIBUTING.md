# Contributing to Peanut

Thank you for considering contributing to Peanut! We welcome contributions from everyone. By participating in this project, you agree to abide by our code of conduct.

## How to Contribute

### Reporting Bugs

1. Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/brandawg93/peanut/issues).
2. If you're unable to find an open issue addressing the problem, open a new one. Be sure to include:

- A descriptive title and summary.
- Steps to reproduce the issue.
- Any relevant logs or screenshots.

### Suggesting Enhancements

1. Check if the enhancement was already suggested by searching on GitHub under [Issues](https://github.com/brandawg93/peanut/issues).
2. If not, open a new issue and provide:

- A clear and descriptive title and summary.
- A detailed description of the proposed enhancement.
- Any relevant examples or use cases.

### Reporting Tested Devices

Use the [Tested Device form](https://github.com/Brandawg93/PeaNUT/issues/new?template=tested_device.yml) to provide the manufacturer, model, NUT driver, operational status, and any limitations. Submitting a report does not publish it automatically.

Maintainers with write access can publish a report by reviewing its fields and applying the `approved-device` label. The report must also have the `tested device` label, which the form adds automatically. The **Publish approved tested device** workflow updates only the tested-device wiki page and closes the issue after the wiki push succeeds. It uses the built-in `GITHUB_TOKEN`; no personal token or external service is needed.

Missing fields, duplicate manufacturer/model/driver combinations, changed reports, and failed wiki pushes leave the issue open. Check the workflow run under **Actions**, correct the report or reconcile an existing wiki entry, then remove and reapply `approved-device` to retry. If the wiki push succeeded but closing the issue failed, rerunning that workflow run recognizes the published report and closes it without adding another row. A report changed after publishing needs manual reconciliation.

Older free-text reports must be converted to the form's `### Manufacturer`, `### Model`, `### Driver`, `### Status`, and optional `### Notes` sections before approval. Status must be `✅ Fully Operational`, `⚠️ Partially Operational`, or `❌ Not Operational`. CyberPower reports are grouped under `CPS` to match the existing wiki.

The `tested device` and `approved-device` repository labels must exist before using the form and workflow. Test the automation locally with `node --test .github/automation/tested-device.test.mjs`.

### Submitting Pull Requests

1. Fork the repository.
2. Create a new branch from `main` for your feature or bugfix.
3. Make your changes.
4. Ensure your code follows the project's coding standards.
5. Commit your changes with a descriptive commit message.
6. Push your branch to your forked repository.
7. Open a pull request against the `main` branch of the original repository.

### Code Style

- Follow the coding style used in the project.
- Write clear, concise, and meaningful commit messages.

### Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Help

If you need help, feel free to ask questions by opening an issue or reaching out to the community.

Thank you for your contributions!
