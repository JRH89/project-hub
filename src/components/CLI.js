export class CLI {
    constructor(container) {
        this.container = container;
        this.project = null;
        this.history = [];
        this.historyIndex = -1;
        this.render();
    }

    setProject(project) {
        this.project = project;
        this.updatePrompt();
    }

    render() {
        this.container.innerHTML = `
            <div class="cli-output" id="cli-output"></div>
            <div class="cli-input-line">
                <span class="cli-prompt" id="cli-prompt">></span>
                <input type="text" class="cli-input" id="cli-input" placeholder="Enter command...">
            </div>
        `;

        this.outputContainer = this.container.querySelector('#cli-output');
        this.input = this.container.querySelector('#cli-input');
        this.prompt = this.container.querySelector('#cli-prompt');

        this.input.addEventListener('keydown', (e) => this.handleInput(e));
    }

    updatePrompt() {
        if (this.project) {
            this.prompt.textContent = `${this.project.name} >`;
            this.input.disabled = false;
            this.input.placeholder = "Enter command (e.g., 'code .', 'dir', 'echo hello')...";
        } else {
            this.prompt.textContent = ">";
            this.input.disabled = true;
            this.input.placeholder = "Select a project to run commands...";
        }
    }

    async handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            if (!command) return;

            this.history.push(command);
            this.historyIndex = this.history.length;
            this.input.value = '';

            this.log(`> ${command}`);

            if (!this.project) {
                this.log('Error: No project selected.');
                return;
            }

            // Execute command via IPC
            // We need a context path. For now, let's assume the project has a "root" path 
            // or we just run it in the user's home dir if not specified.
            // But wait, projects are just lists of files. 
            // Let's try to infer a root, or just run in the directory of the first file?
            // Or maybe we should let the user set a "Project Root".
            // For now, let's just run it in the directory of the first file if available, or Home.

            let cwd = 'C:\\Users\\Jared'; // Default
            if (this.project.files.length > 0) {
                const firstFile = this.project.files[0];
                if (firstFile.type === 'directory') {
                    cwd = firstFile.path;
                } else {
                    // Get parent dir of file
                    // We need a way to get dirname. 
                    // Let's just pass the file path and let main process handle cwd logic?
                    // Or just use the first directory found.
                    const firstDir = this.project.files.find(f => f.type === 'directory');
                    if (firstDir) cwd = firstDir.path;
                }
            }

            try {
                const result = await window.api.runCommand(command, cwd);
                if (result.error) {
                    this.log(`Error: ${result.error}`, 'error');
                } else {
                    this.log(result.stdout);
                    if (result.stderr) this.log(result.stderr, 'warning');
                }
            } catch (err) {
                this.log(`Execution failed: ${err.message}`, 'error');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        }
    }

    log(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `cli-line ${type}`;
        line.textContent = message;
        this.outputContainer.appendChild(line);
        this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
    }
}
