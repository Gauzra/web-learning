import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({
    isOpen,
    title = 'Konfirmasi',
    message,
    confirmText = 'Ya, Keluar',
    cancelText = 'Batal',
    onConfirm,
    onCancel
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="confirm-modal-overlay"
            onClick={onCancel}
        >
            <div
                className="confirm-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="confirm-modal-content">

                    <h2>{title}</h2>

                    <p>{message}</p>

                </div>

                <div className="confirm-modal-actions">

                    <button
                        type="button"
                        className="confirm-modal-cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className="confirm-modal-confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>
            </div>
        </div>
    );
}