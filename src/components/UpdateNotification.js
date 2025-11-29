import React, { useState, useEffect } from 'react';

const UpdateNotification = () => {
    const [updateInfo, setUpdateInfo] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Listen for update available
        window.api.onUpdateAvailable((info) => {
            setUpdateInfo(info);
            setShow(true);
            setDownloading(false);
        });

        // Listen for download progress
        window.api.onUpdateProgress((progressData) => {
            setProgress(progressData.percent);
            setDownloading(true);
        });

        // Listen for download complete
        window.api.onUpdateDownloaded((info) => {
            setDownloading(false);
            setProgress(100);
        });
    }, []);

    const handleDownload = () => {
        window.api.downloadUpdate();
    };

    const handleInstall = () => {
        window.api.installUpdate();
    };

    const handleDismiss = () => {
        setShow(false);
    };

    const handleCheckForUpdates = () => {
        window.api.checkForUpdates();
    };

    if (!show) {
        return (
            <div className="update-checker">
                <button 
                    onClick={handleCheckForUpdates}
                    className="check-updates-btn"
                    title="Check for updates"
                >
                    🔄
                </button>
            </div>
        );
    }

    return (
        <div className="update-notification">
            <div className="update-content">
                <div className="update-header">
                    <h4>📦 Update Available</h4>
                    <button onClick={handleDismiss} className="close-btn">×</button>
                </div>
                
                {updateInfo && (
                    <div className="update-info">
                        <p><strong>Version {updateInfo.version}</strong></p>
                        {updateInfo.releaseNotes && (
                            <div className="release-notes">
                                <p>{updateInfo.releaseNotes}</p>
                            </div>
                        )}
                    </div>
                )}

                {downloading && (
                    <div className="download-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span>{progress}%</span>
                    </div>
                )}

                <div className="update-actions">
                    {!downloading && progress === 0 && (
                        <>
                            <button onClick={handleDownload} className="btn btn-primary">
                                Download Update
                            </button>
                            <button onClick={handleDismiss} className="btn btn-secondary">
                                Later
                            </button>
                        </>
                    )}
                    
                    {progress === 100 && !downloading && (
                        <>
                            <button onClick={handleInstall} className="btn btn-success">
                                Restart & Install
                            </button>
                            <button onClick={handleDismiss} className="btn btn-secondary">
                                Install Later
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .update-checker {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                }

                .check-updates-btn {
                    background: #2d2d2d;
                    border: 1px solid #444;
                    color: #fff;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .check-updates-btn:hover {
                    background: #3d3d3d;
                    border-color: #666;
                }

                .update-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2d2d2d;
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 20px;
                    min-width: 350px;
                    max-width: 450px;
                    z-index: 10000;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    color: #fff;
                }

                .update-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .update-header h4 {
                    margin: 0;
                    color: #4CAF50;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn:hover {
                    color: #fff;
                }

                .update-info {
                    margin-bottom: 15px;
                }

                .update-info p {
                    margin: 0 0 10px 0;
                }

                .release-notes {
                    background: #1e1e1e;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .download-progress {
                    margin-bottom: 15px;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #1e1e1e;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 5px;
                }

                .progress-fill {
                    height: 100%;
                    background: #4CAF50;
                    transition: width 0.3s ease;
                }

                .download-progress span {
                    font-size: 14px;
                    color: #999;
                }

                .update-actions {
                    display: flex;
                    gap: 10px;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: #4CAF50;
                    color: white;
                }

                .btn-primary:hover {
                    background: #45a049;
                }

                .btn-success {
                    background: #2196F3;
                    color: white;
                }

                .btn-success:hover {
                    background: #1976D2;
                }

                .btn-secondary {
                    background: #666;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #777;
                }
            `}</style>
        </div>
    );
};

export default UpdateNotification;
