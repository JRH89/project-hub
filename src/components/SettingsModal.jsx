import React, { useState, useEffect } from 'react';

const SettingsModal = ({ onClose }) => {
    const [autoUpdate, setAutoUpdate] = useState(true);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Load current setting
        window.api.getAutoUpdateSetting().then(setAutoUpdate);
        setShow(true);
    }, []);

    const handleAutoUpdateChange = async (enabled) => {
        setAutoUpdate(enabled);
        await window.api.setAutoUpdateSetting(enabled);
    };

    const handleClose = () => {
        setShow(false);
        setTimeout(onClose, 300);
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>
                
                <div className="modal-body">
                    <div className="settings-section">
                        <h3>Updates</h3>
                        <div className="setting-item">
                            <label className="setting-label">
                                <input
                                    type="checkbox"
                                    checked={autoUpdate}
                                    onChange={(e) => handleAutoUpdateChange(e.target.checked)}
                                />
                                <span>Automatic Updates</span>
                            </label>
                            <p className="setting-description">
                                Automatically download and install updates when available
                            </p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleClose}>
                        Close
                    </button>
                </div>

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        opacity: 0;
                        animation: fadeIn 0.3s forwards;
                    }

                    @keyframes fadeIn {
                        to { opacity: 1; }
                    }

                    .modal {
                        background: #2d2d2d;
                        border: 1px solid #444;
                        border-radius: 8px;
                        min-width: 500px;
                        max-width: 90vw;
                        max-height: 90vh;
                        overflow: hidden;
                        color: #fff;
                        transform: scale(0.9);
                        animation: scaleIn 0.3s forwards;
                    }

                    @keyframes scaleIn {
                        to { transform: scale(1); }
                    }

                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px;
                        border-bottom: 1px solid #444;
                    }

                    .modal-header h2 {
                        margin: 0;
                        color: #fff;
                    }

                    .close-btn {
                        background: none;
                        border: none;
                        color: #999;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 0;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 4px;
                        transition: all 0.2s;
                    }

                    .close-btn:hover {
                        background: #444;
                        color: #fff;
                    }

                    .modal-body {
                        padding: 20px;
                        max-height: 60vh;
                        overflow-y: auto;
                    }

                    .settings-section {
                        margin-bottom: 30px;
                    }

                    .settings-section h3 {
                        margin: 0 0 15px 0;
                        color: #4CAF50;
                        font-size: 18px;
                    }

                    .setting-item {
                        margin-bottom: 20px;
                    }

                    .setting-label {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        cursor: pointer;
                        font-size: 16px;
                    }

                    .setting-label input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                        accent-color: #4CAF50;
                    }

                    .setting-description {
                        margin: 8px 0 0 28px;
                        color: #999;
                        font-size: 14px;
                        line-height: 1.4;
                    }

                    .modal-footer {
                        padding: 20px;
                        border-top: 1px solid #444;
                        display: flex;
                        justify-content: flex-end;
                    }

                    .btn {
                        padding: 10px 20px;
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
                `}</style>
            </div>
        </div>
    );
};

export default SettingsModal;
