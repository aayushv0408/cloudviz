'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Info,
  Calendar,
  HardDrive,
  FileCode,
  Music,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Cpu,
  Layers,
  Shield,
} from 'lucide-react';
import { MediaFile } from '@/lib/types';
import { formatBytes, formatDate, formatDuration } from '@/lib/utils';
import { useToast } from './Toast';

interface MediaViewerModalProps {
  file: MediaFile | null;
  onClose: () => void;
  onShare: (file: MediaFile) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function MediaViewerModal({
  file,
  onClose,
  onShare,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: MediaViewerModalProps) {
  const { toast } = useToast();

  // Image controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Video / Audio controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // UI state
  const [showInfo, setShowInfo] = useState(true);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [file?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === ' ' && (file?.mediaType === 'video' || file?.mediaType === 'audio')) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!file) return null;

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      if (!duration && mediaRef.current.duration) {
        setDuration(mediaRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (mediaRef.current) {
      mediaRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    if (isMuted) {
      mediaRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      mediaRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = speed;
    }
    toast(`Playback rate: ${speed}x`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Top HUD Action Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/90 to-transparent font-mono">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-cyan-300 max-w-sm truncate text-xs">
            {file.name}
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
            {formatBytes(file.size)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom & Rotate controls for Images */}
          {file.mediaType === 'image' && (
            <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-700/80 mr-2">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] px-2 text-cyan-400 font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => onShare(file)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SHARE</span>
          </button>

          <a
            href={file.url}
            download={file.originalName}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GET</span>
          </a>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-xl transition-all ${
              showInfo
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Telemetry details"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/75 border border-cyan-500/30 text-white hover:bg-black hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/75 border border-cyan-500/30 text-white hover:bg-black hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Content Viewer Area */}
      <div className="w-full h-full flex items-center justify-center p-6 pt-16">
        <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
          {/* IMAGE VIEWER */}
          {file.mediaType === 'image' && (
            <div className="relative max-w-full max-h-full flex items-center justify-center overflow-auto p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.url}
                alt={file.name}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="max-h-[82vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>
          )}

          {/* VIDEO VIEWER */}
          {file.mediaType === 'video' && (
            <div className="relative max-w-4xl w-full flex flex-col items-center bg-black/80 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.15)] corner-bracket">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={file.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
                onClick={togglePlay}
                className="max-h-[65vh] w-full object-contain cursor-pointer"
                playsInline
              />

              {/* Custom Cyber Player Bar */}
              <div className="w-full p-4 bg-[#060a17]/95 border-t border-slate-800 font-mono space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black transition-colors shadow-md shadow-cyan-500/30"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-slate-800 rounded appearance-none accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <span className="font-mono text-cyan-400 text-[11px]">
                      {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
                    {[0.5, 1, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-cyan-500 text-black font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUDIO VIEWER */}
          {file.mediaType === 'audio' && (
            <div className="w-full max-w-xl p-8 rounded-3xl bg-[#080d1e]/90 border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)] backdrop-blur-2xl flex flex-col items-center corner-bracket font-mono">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/25 mb-6">
                <Music className="w-12 h-12 stroke-[2.5]" />
              </div>

              <h3 className="text-base font-bold text-white text-center mb-1">{file.name}</h3>
              <p className="text-[11px] text-slate-500 mb-6">{file.originalName}</p>

              {/* Animated Waveform Simulation */}
              <div className="w-full flex items-center justify-center gap-1.5 h-16 mb-6 px-4">
                {[30, 50, 80, 45, 90, 100, 70, 40, 85, 95, 60, 35, 75, 90, 50, 30].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: isPlaying ? `${Math.max(15, (h * Math.sin((currentTime + i) * 2) + 100) / 2)}%` : `${h * 0.4}%`,
                    }}
                    className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150 shadow-[0_0_6px_#34d399]"
                  />
                ))}
              </div>

              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={file.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
              />

              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 mb-2"
              />

              <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-6">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>

              <div className="flex items-center gap-6">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-400/40 transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  {[1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded ${playbackSpeed === speed ? 'bg-slate-800 text-emerald-400 font-bold' : 'hover:text-white'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT VIEWER */}
          {file.mediaType === 'document' && (
            <div className="w-full max-w-4xl h-[78vh] flex flex-col bg-[#080d1e] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl corner-bracket">
              {file.mimeType === 'application/pdf' ? (
                <iframe
                  src={file.url}
                  className="w-full h-full border-none"
                  title={file.name}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-mono">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                    <FileCode className="w-10 h-10" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{file.name}</h3>
                  <p className="text-xs text-slate-400 max-w-md mb-6">
                    [NON_STREAMABLE_DOCUMENT] Native viewer recommended for this binary.
                  </p>
                  <a
                    href={file.url}
                    download={file.originalName}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>RETRIEVE_FILE ({formatBytes(file.size)})</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* OTHER / BINARY VIEWER */}
          {file.mediaType === 'other' && (
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#080d1e] border border-cyan-500/30 text-center shadow-2xl font-mono corner-bracket">
              <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                <FileCode className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{file.name}</h3>
              <p className="text-xs text-slate-500 mb-6">{file.mimeType}</p>
              <a
                href={file.url}
                download={file.originalName}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD_BINARY ({formatBytes(file.size)})</span>
              </a>
            </div>
          )}
        </div>

        {/* Right Info Drawer (Hacker Telemetry HUD) */}
        {showInfo && (
          <aside className="w-80 h-full bg-[#060a17]/95 border-l border-slate-800/80 p-6 flex flex-col justify-between overflow-y-auto hidden md:flex animate-in slide-in-from-right duration-200 font-mono">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>TELEMETRY_INSPECTOR</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block mb-1">OBJECT_NAME</span>
                  <span className="text-slate-200 font-sans font-medium break-all">{file.name}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block mb-1">FILE_SPEC</span>
                  <span className="text-cyan-300 font-mono text-[11px] break-all">{file.originalName}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">ALLOCATED_SIZE</span>
                    <span className="text-slate-200 font-mono">{formatBytes(file.size)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">FORMAT</span>
                    <span className="text-emerald-400 font-mono uppercase">{file.mediaType}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block mb-1">MIME_SIGNATURE</span>
                  <span className="text-slate-400 font-mono text-[10px]">{file.mimeType}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block mb-1">STORAGE_BACKEND</span>
                  <div className="flex items-center gap-1.5 text-cyan-400 font-medium uppercase text-[11px]">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{file.storageProvider}::SECURE</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block mb-1">TIMESTAMP</span>
                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                </div>

                {file.metadata?.tags && file.metadata.tags.length > 0 && (
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1.5">METADATA_TAGS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {file.metadata.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-400 text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-mono transition-colors border border-cyan-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>DIRECT_CLOUD_STREAM</span>
              </a>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
