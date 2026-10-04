import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  QrCode,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  publicUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    publicUrl
  )}&bgcolor=1A1F2C&color=FFFFFF&margin=10`;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-header-title">
            <Share2 className="text-accent" size={20} />
            <h2>Compartir Maqueta 3D con el Cliente</h2>
          </div>
          <button className="btn-close-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p className="card-hint" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Tu cliente puede abrir este enlace desde <strong>cualquier red o teléfono móvil</strong> (Android / iPhone) sin instalar ninguna aplicación.
          </p>

          {/* QR CODE */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 14,
              padding: '1.25rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src={qrImageUrl}
              alt="QR Code Maqueta 3D"
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <QrCode size={14} /> Escanea con la cámara de cualquier celular
            </span>
          </div>

          {/* ENLACE PÚBLICO */}
          <div className="input-card" style={{ marginTop: '1rem', textAlign: 'left' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={15} className="text-accent" /> Enlace Público del Túnel (HTTPS)
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="text-input"
                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
              <button
                className="btn-action primary"
                onClick={handleCopy}
                style={{ padding: '0.5rem 0.9rem', whiteSpace: 'nowrap' }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* MENSAJE DE AYUDA PARA EL CLIENTE */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 9,
              padding: '0.75rem 0.95rem',
              textAlign: 'left',
              fontSize: '0.78rem',
              color: '#c7d2fe',
              marginTop: '0.5rem',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <Smartphone size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Instrucciones para el cliente:</strong>
              <p style={{ marginTop: 3, opacity: 0.9 }}>
                Al entrar al link desde el teléfono, tocar con un dedo para rotar la casa 3D en 360° y pellizcar con dos dedos para hacer zoom en las herramientas y muebles.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            <ExternalLink size={14} /> Abrir en nueva pestaña
          </a>
          <button className="btn-primary-action" onClick={onClose} style={{ marginLeft: 8 }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
