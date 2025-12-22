class UpdateNotification {
    constructor(container) {
        this.container = container;
        this.updateInfo = null;
        this.downloading = false;
        this.progress = 0;
        this.show = false;
        this.init();
    }

    init() {
        // Listen for update available
        window.api.onUpdateAvailable((info) => {
            this.updateInfo = info;
            this.show = true;
            this.downloading = false;
            this.render();
        });

        // Listen for download progress
        window.api.onUpdateProgress((progressData) => {
            this.progress = progressData.percent;
            this.downloading = true;
            this.render();
        });

        // Listen for download complete
        window.api.onUpdateDownloaded((info) => {
            this.downloading = false;
            this.progress = 100;
            this.render();
        });

        this.render();
    }

    handleDownload() {
        window.api.downloadUpdate();
    }

    handleInstall() {
        window.api.installUpdate();
    }

    handleDismiss() {
        this.show = false;
        this.render();
    }

    handleCheckForUpdates() {
        window.api.checkForUpdates();
    }

    render() {
        // Only show if there's an update available
        if (!this.show) {
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = `
            <div class="update-notification">
                <div class="update-content">
                    <div class="update-header">
                        <h4>📦 Update Available</h4>
                        <button onclick="window.updateNotification.handleDismiss()" class="close-btn">×</button>
                    </div>
                    
                    ${this.updateInfo ? `
                        <div class="update-info">
                            <p><strong>Version ${this.updateInfo.version}</strong></p>
                            ${this.updateInfo.releaseNotes ? `
                                <div class="release-notes">
                                    <p>${this.updateInfo.releaseNotes}</p>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${this.downloading ? `
                        <div class="download-progress">
                            <div class="progress-bar">
                                <div 
                                    class="progress-fill" 
                                    style="width: ${this.progress}%"
                                ></div>
                            </div>
                            <span>${this.progress}%</span>
                        </div>
                    ` : ''}

                    <div class="update-actions">
                        ${!this.downloading && this.progress === 0 ? `
                            <button onclick="window.updateNotification.handleDownload()" class="btn btn-primary">
                                Download Update
                            </button>
                            <button onclick="window.updateNotification.handleDismiss()" class="btn btn-secondary">
                                Later
                            </button>
                        ` : ''}
                        
                        ${this.progress === 100 && !this.downloading ? `
                            <button onclick="window.updateNotification.handleInstall()" class="btn btn-success">
                                Restart & Install
                            </button>
                            <button onclick="window.updateNotification.handleDismiss()" class="btn btn-secondary">
                                Install Later
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

export { UpdateNotification };
