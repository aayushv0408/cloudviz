'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cloud,
  Cpu,
  Radio,
  Terminal,
} from 'lucide-react';
import { useToast } from './Toast';

interface StorageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export function StorageSettingsModal({
  isOpen,
  onClose,
  onConfigSaved,
}: StorageSettingsModalProps) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<'local' | 's3' | 'r2' | 'supabase'>('local');
  const [bucket, setBucket] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [endpoint, setEndpoint] = useState('');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [publicUrlPrefix, setPublicUrlPrefix] = useState('');

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/storage/settings')
        .then(res => res.json())
        .then(data => {
          if (data.config) {
            setProvider(data.config.provider || 'local');
            setBucket(data.config.bucket || '');
            setRegion(data.config.region || 'us-east-1');
            setEndpoint(data.config.endpoint || '');
            setPublicUrlPrefix(data.config.publicUrlPrefix || '');
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setStatusMessage('Transmitting handshake to cloud bucket...');

    try {
      const res = await fetch('/api/storage/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          bucket,
          region,
          endpoint,
          accessKeyId,
          secretAccessKey,
          publicUrlPrefix,
          testOnly: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setStatusMessage(data.message || 'Handshake verified successfully!');
        toast('Bucket handshake successful', 'success');
      } else {
        setTestStatus('error');
        setStatusMessage(data.error || 'Handshake failed.');
        toast('Connection handshake failed', 'error');
      }
    } catch (err: unknown) {
      setTestStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Handshake failed');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/storage/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          bucket,
          region,
          endpoint,
          accessKeyId,
          secretAccessKey,
          publicUrlPrefix,
          testOnly: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setStatusMessage(data.message);
        toast('Storage engine reconfigured', 'success');
        setTimeout(() => {
          onConfigSaved();
          onClose();
        }, 1000);
      } else {
        setTestStatus('error');
        setStatusMessage(data.error || 'Failed to save configuration');
        toast('Failed to save config', 'error');
      }
    } catch (err: unknown) {
      setTestStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#080d1e] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] font-mono corner-bracket">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">STORAGE::ENGINE_SETTINGS</h3>
              <p className="text-[10px] text-slate-500">// CLOUD_OBJECT_BUCKET_INTEGRATION</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              STORAGE_BACKEND_PROVIDER
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'local', name: 'LOCAL_DISK', desc: 'Sandbox node' },
                { id: 's3', name: 'AWS_S3', desc: 'Amazon Cloud' },
                { id: 'r2', name: 'CF_R2', desc: 'Zero egress fee' },
                { id: 'supabase', name: 'SUPABASE', desc: 'S3 compatible' },
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProvider(p.id as 'local' | 's3' | 'r2' | 'supabase')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    provider === p.id
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-[11px] mb-0.5">{p.name}</div>
                  <div className="text-[9px] text-slate-500">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {provider === 'local' ? (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <HardDrive className="w-4 h-4" />
                <span>MOUNTED: Local Filesystem Storage</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Files are stored directly in your workspace under <code className="text-cyan-200 font-mono">public/uploads</code>.
                You can switch to AWS S3 or Cloudflare R2 anytime by selecting the cloud provider above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1 text-[11px]">
                  BUCKET_NAME <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. cloudstore-media-vault"
                  value={bucket}
                  onChange={e => setBucket(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-medium block mb-1 text-[11px]">
                    REGION <span className="text-slate-500">(us-east-1 / auto)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="us-east-1"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1 text-[11px]">
                    CUSTOM_ENDPOINT <span className="text-slate-500">(R2/MinIO)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://<id>.r2.cloudflarestorage.com"
                    value={endpoint}
                    onChange={e => setEndpoint(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1 text-[11px]">
                  ACCESS_KEY_ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={accessKeyId}
                  onChange={e => setAccessKeyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1 text-[11px]">
                  SECRET_ACCESS_KEY <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  value={secretAccessKey}
                  onChange={e => setSecretAccessKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1 text-[11px]">
                  PUBLIC_CDN_PREFIX <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://media.yourdomain.com"
                  value={publicUrlPrefix}
                  onChange={e => setPublicUrlPrefix(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Test Status Feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs ${
                testStatus === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : testStatus === 'error'
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
              }`}
            >
              {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              <span className="flex-1">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {provider !== 'local' ? (
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || !bucket || !accessKeyId || !secretAccessKey}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-300 text-xs transition-colors"
            >
              {testStatus === 'testing' ? 'VERIFYING...' : 'TEST_HANDSHAKE'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs transition-colors"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              {saving ? 'COMMITTING...' : 'SAVE_CONFIG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
