export class PromptModal {
    constructor(container) {
        this.container = container;
        this.resolve = null;
        this.render();
    }

    render() {
        this.container.className = 'modal-overlay';
        this.container.style.display = 'none';
        this.container.innerHTML = `
      <div class="modal-content" style="width: 400px; height: auto;">
        <div class="modal-header">
          <h3 id="prompt-message">Enter Value</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body" style="padding: 20px;">
          <input type="text" id="prompt-input" style="width: 100%;" />
        </div>
        <div class="modal-footer">
          <button id="prompt-cancel-btn">Cancel</button>
          <button id="prompt-ok-btn" style="background-color: var(--accent-color); color: white; border: none;">OK</button>
        </div>
      </div>
    `;

        this.input = this.container.querySelector('#prompt-input');

        this.container.querySelector('.close-btn').addEventListener('click', () => this.close(null));
        this.container.querySelector('#prompt-cancel-btn').addEventListener('click', () => this.close(null));

        this.container.querySelector('#prompt-ok-btn').addEventListener('click', () => {
            this.close(this.input.value);
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.close(this.input.value);
            if (e.key === 'Escape') this.close(null);
        });
    }

    open(message) {
        this.container.querySelector('#prompt-message').textContent = message;
        this.input.value = '';
        this.container.style.display = 'flex';
        this.input.focus();

        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    close(value) {
        this.container.style.display = 'none';
        if (this.resolve) {
            this.resolve(value);
            this.resolve = null;
        }
    }
}
