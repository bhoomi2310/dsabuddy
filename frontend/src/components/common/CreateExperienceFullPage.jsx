import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import apiClient from '@/api/client';
import { getErrorMessage } from '@/utils';

const BLOCK_TYPES = [
  { type: 'text',       emoji: '¶',   label: 'Paragraph',    desc: 'Plain text' },
  { type: 'heading',    emoji: 'H1',  label: 'Heading',      desc: 'Big section' },
  { type: 'subheading', emoji: 'H2',  label: 'Subheading',   desc: 'Medium section' },
  { type: 'image',      emoji: '🖼',  label: 'Image',        desc: 'Upload a photo' },
  { type: 'quote',      emoji: '"',   label: 'Quote',        desc: 'Highlighted text' },
  { type: 'code',       emoji: '</>',  label: 'Code Block',   desc: 'Code snippet' },
  { type: 'bullet',     emoji: '•',   label: 'Bullet List',  desc: 'List item' },
  { type: 'divider',    emoji: '—',   label: 'Divider',      desc: 'Horizontal rule' },
];

const _buid = () => `b${Date.now()}${Math.random().toString(36).slice(2, 5)}`;

const sanitizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  if (!/^(https?:)?\/\//i.test(trimmed) && !/^[./#]/i.test(trimmed)) {
    return '';
  }
  return trimmed;
};

const escapeAttr = (str) => {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

const parseMarkdownToHTML = (text) => {
  if (!text) return '';
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-white text-lg font-bold mt-4 mb-2 ">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-white text-xl font-bold mt-4 mb-2 ">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-white text-2xl font-bold mt-4 mb-2 ">$1</h1>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-[#0D1117] border border-[#1F2937] rounded-xl p-4 font-mono text-xs my-4 overflow-x-auto text-gray-300">$1</pre>');
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-[#0D1117] border border-[#1F2937] rounded px-1.5 py-0.5 font-mono text-xs text-[#FF453A]">$1</code>');
  
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return '[Invalid Image URL]';
    return `<div class="my-4 flex justify-center"><img src="${escapeAttr(safeUrl)}" alt="${escapeAttr(alt)}" class="max-w-full rounded-xl object-contain max-h-[400px] border border-[#1F2937] shadow-lg" /></div>`;
  });

  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return text;
    return `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="text-[#35b9f1] hover:underline">${text}</a>`;
  });

  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([\s\S]*?)_/g, '<em>$1</em>');
  html = html.replace(/^\s*[-*+]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-gray-300 ">$1</li>');
  html = html.replace(/\n/g, '<br />');

  return html;
};

const htmlToBlocks = (html) => {
  if (!html) return [{ id: _buid(), type: 'text', html: '', url: '', caption: '' }];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks = [];

  const addBlockFromNode = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({ id: _buid(), type: 'text', html: text, url: '', caption: '' });
      }
      return;
    }

    if (node.nodeType !== 1) return;

    const type = node.tagName.toLowerCase();
    switch (type) {
      case 'p':
      case 'div':
        const innerImg = node.querySelector('img');
        if (innerImg) {
          blocks.push({
            id: _buid(),
            type: 'image',
            html: '',
            url: innerImg.src || '',
            caption: innerImg.alt || '',
          });
        } else {
          blocks.push({ id: _buid(), type: 'text', html: node.innerHTML, url: '', caption: '' });
        }
        break;
      case 'h2':
        blocks.push({ id: _buid(), type: 'heading', html: node.innerHTML, url: '', caption: '' });
        break;
      case 'h3':
      case 'h1':
        blocks.push({ id: _buid(), type: 'subheading', html: node.innerHTML, url: '', caption: '' });
        break;
      case 'blockquote':
        blocks.push({ id: _buid(), type: 'quote', html: node.innerHTML, url: '', caption: '' });
        break;
      case 'pre':
        const codeNode = node.querySelector('code');
        blocks.push({
          id: _buid(),
          type: 'code',
          html: codeNode ? codeNode.innerHTML : node.innerHTML,
          url: '',
          caption: '',
        });
        break;
      case 'ul':
        Array.from(node.childNodes).forEach((li) => {
          if (li.nodeType === 1 && li.tagName.toLowerCase() === 'li') {
            blocks.push({ id: _buid(), type: 'bullet', html: li.innerHTML, url: '', caption: '' });
          }
        });
        break;
      case 'li':
        blocks.push({ id: _buid(), type: 'bullet', html: node.innerHTML, url: '', caption: '' });
        break;
      case 'hr':
        blocks.push({ id: _buid(), type: 'divider', html: '', url: '', caption: '' });
        break;
      case 'figure':
        const img = node.querySelector('img');
        const figcaption = node.querySelector('figcaption');
        if (img) {
          blocks.push({
            id: _buid(),
            type: 'image',
            html: '',
            url: img.src || '',
            caption: figcaption ? figcaption.textContent : (img.alt || ''),
          });
        }
        break;
      case 'img':
        blocks.push({
          id: _buid(),
          type: 'image',
          html: '',
          url: node.src || '',
          caption: node.alt || '',
        });
        break;
      case 'br':
        break;
      default:
        if (node.textContent?.trim()) {
          blocks.push({ id: _buid(), type: 'text', html: node.outerHTML || node.textContent, url: '', caption: '' });
        }
        break;
    }
  };

  Array.from(doc.body.childNodes).forEach(child => {
    addBlockFromNode(child);
  });

  if (blocks.length === 0) {
    blocks.push({ id: _buid(), type: 'text', html: '', url: '', caption: '' });
  }

  return blocks;
};

export function CreateExperienceFullPage({ 
  company, 
  initialTitle = '', 
  initialContent = '', 
  initialTags = [], 
  onPublish, 
  onCancel 
}) {
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState(() => {
    const defaultTags = company ? [company] : [];
    const merged = [...new Set([...defaultTags, ...initialTags])];
    return merged;
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [blockMenuId, setBlockMenuId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selFmt, setSelFmt] = useState(null);

  const blockRefs = useRef({});
  const titleRef = useRef(null);

  const [blocks, setBlocks] = useState(() => {
    if (initialContent) {
      const isHtml = /<\/?[a-z][\s\S]*>/i.test(initialContent);
      const htmlContent = isHtml ? initialContent : parseMarkdownToHTML(initialContent);
      return htmlToBlocks(htmlContent);
    }
    return [{ id: _buid(), type: 'text', html: '', url: '', caption: '' }];
  });

  const focusEnd = (el) => {
    if (!el) return;
    try {
      el.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (_) {}
  };

  const isElEmpty = (el) =>
    !el || !el.textContent?.trim() || el.textContent.trim() === '\n';

  const addBlock = (afterId, type = 'text') => {
    const newId = _buid();
    const nb = { id: newId, type, html: '', url: '', caption: '' };
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === afterId);
      const next = [...prev];
      next.splice(i + 1, 0, nb);
      return next;
    });
    setBlockMenuId(null);
    if (type !== 'image' && type !== 'divider') {
      setTimeout(() => focusEnd(blockRefs.current[newId]), 40);
    }
  };

  const updateBlock = (id, changes) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b));

  const deleteBlock = (id) => {
    setBlocks(prev => {
      if (prev.length <= 1) return prev;
      const i = prev.findIndex(b => b.id === id);
      const prevId = i > 0 ? prev[i - 1].id : null;
      const next = prev.filter(b => b.id !== id);
      if (prevId) setTimeout(() => focusEnd(blockRefs.current[prevId]), 20);
      return next;
    });
  };

  const uploadImage = async (afterId, file) => {
    if (!file?.type.startsWith('image/')) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    setError('');
    try {
      const res = await apiClient.post('/upload/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res?.url || res?.data?.url;
      if (!url) { setError('Upload failed — no URL returned.'); return; }
      const imgId = _buid();
      const textId = _buid();
      setBlocks(prev => {
        const i = prev.findIndex(b => b.id === afterId);
        const cur = prev[i];
        const next = [...prev];
        if (cur.type === 'text' && isElEmpty(blockRefs.current[cur.id])) {
          next[i] = { id: imgId, type: 'image', url, caption: '', html: '' };
        } else {
          next.splice(i + 1, 0, { id: imgId, type: 'image', url, caption: '', html: '' });
        }
        const imgIdx = next.findIndex(b => b.id === imgId);
        next.splice(imgIdx + 1, 0, { id: textId, type: 'text', html: '', url: '', caption: '' });
        return next;
      });
      setTimeout(() => focusEnd(blockRefs.current[textId]), 60);
    } catch (_) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = async (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find(it => it.type.startsWith('image/'));
    if (!imgItem) return;
    e.preventDefault();
    const file = imgItem.getAsFile();
    const activeEl = document.activeElement;
    const activeId = Object.keys(blockRefs.current).find(id => blockRefs.current[id] === activeEl);
    await uploadImage(activeId || blocks[blocks.length - 1].id, file);
  };

  const handleKeyDown = (e, block, idx) => {
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault();
      addBlock(block.id, 'text');
    } else if (e.key === 'Backspace') {
      const el = blockRefs.current[block.id];
      if (isElEmpty(el) && blocks.length > 1) {
        e.preventDefault();
        deleteBlock(block.id);
      }
    }
  };

  const handleSelectionChange = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) { setSelFmt(null); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = document.getElementById('exp-editor-area')?.getBoundingClientRect();
    if (!editorRect) return;
    setSelFmt({ x: rect.left - editorRect.left + rect.width / 2, y: rect.top - editorRect.top - 44 });
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const blocksToHTML = () => {
    let html = '';
    let inList = false;
    for (const b of blocks) {
      if (b.type !== 'bullet' && inList) { html += '</ul>'; inList = false; }
      switch (b.type) {
        case 'text':
          if (b.html?.trim()) html += `<p>${b.html}</p>`;
          break;
        case 'heading':
          if (b.html?.trim()) html += `<h2>${b.html}</h2>`;
          break;
        case 'subheading':
          if (b.html?.trim()) html += `<h3>${b.html}</h3>`;
          break;
        case 'image':
          if (b.url) html += `<figure><img src="${b.url}" alt="${b.caption || ''}" />${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}</figure>`;
          break;
        case 'quote':
          if (b.html?.trim()) html += `<blockquote>${b.html}</blockquote>`;
          break;
        case 'code':
          if (b.html?.trim()) html += `<pre><code>${b.html}</code></pre>`;
          break;
        case 'bullet':
          if (!inList) { html += '<ul>'; inList = true; }
          if (b.html?.trim()) html += `<li>${b.html}</li>`;
          break;
        case 'divider':
          html += '<hr />';
          break;
      }
    }
    if (inList) html += '</ul>';
    return html;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required.');
      titleRef.current?.focus();
      return;
    }

    const htmlContent = blocksToHTML();
    const hasText = htmlContent.replace(/<[^>]*>/g, '').trim().length > 0;
    const hasImage = htmlContent.includes('<img');
    const hasDivider = htmlContent.includes('<hr');

    if (!hasText && !hasImage && !hasDivider) {
      setError('Body content is empty. Please add some text or an image before publishing.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onPublish({ title: title.trim(), content: htmlContent, tags });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const renderBlockContent = (block, idx) => {
    const commonTextProps = (cls, placeholder) => ({
      ref: (el) => { blockRefs.current[block.id] = el; },
      contentEditable: true,
      suppressContentEditableWarning: true,
      'data-placeholder': placeholder,
      onInput: (e) => updateBlock(block.id, { html: e.currentTarget.innerHTML }),
      onKeyDown: (e) => handleKeyDown(e, block, idx),
      className: `${cls} outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-700 empty:before:pointer-events-none`,
    });

    switch (block.type) {
      case 'text':
        return <div {...commonTextProps('min-h-[28px] text-[#D7DADC] text-base leading-7 ', "Start writing, or press '/' to insert a block...")} />;

      case 'heading':
        return <div {...commonTextProps('min-h-[44px] text-white text-2xl font-extrabold leading-snug ', 'Heading...')} />;

      case 'subheading':
        return <div {...commonTextProps('min-h-[36px] text-neutral-200 text-xl font-bold leading-snug ', 'Subheading...')} />;

      case 'quote':
        return <div {...commonTextProps('min-h-[28px] border-l-4 border-[#35b9f1] pl-4 text-neutral-400 italic text-base leading-7 ', 'Write a notable quote...')} />;

      case 'code':
        return (
          <div
            ref={(el) => { blockRefs.current[block.id] = el; }}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="// Paste your code here..."
            onInput={(e) => updateBlock(block.id, { html: e.currentTarget.innerHTML })}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && isElEmpty(blockRefs.current[block.id]) && blocks.length > 1) {
                e.preventDefault(); deleteBlock(block.id);
              }
            }}
            className="min-h-[60px] bg-[#0A0A0B] border border-neutral-800 rounded-xl px-5 py-4 text-green-400 text-sm font-mono leading-relaxed outline-none whitespace-pre empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-700 empty:before:pointer-events-none"
          />
        );

      case 'bullet':
        return (
          <div className="flex items-start gap-2.5">
            <span className="text-[#35b9f1] text-base mt-[3px] select-none font-bold shrink-0">•</span>
            <div {...commonTextProps('flex-1 min-h-[28px] text-[#D7DADC] text-base leading-7 ', 'List item...')} />
          </div>
        );

      case 'image':
        return block.url ? (
          <div className="group/img relative">
            <img src={block.url} alt={block.caption || 'Uploaded image'} className="w-full rounded-xl object-contain max-h-[500px] border border-neutral-800 bg-black" />
            <button
              type="button"
              onClick={() => deleteBlock(block.id)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black cursor-pointer opacity-0 group-hover/img:opacity-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Add a caption (optional)..."
              value={block.caption}
              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
              className="w-full mt-2.5 bg-transparent text-center text-neutral-500 text-sm placeholder-neutral-700 focus:outline-none focus:text-neutral-300 transition-colors"
            />
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-neutral-800 rounded-xl py-12 cursor-pointer hover:border-neutral-600 hover:bg-neutral-900/20 transition-all group/upload"
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#35b9f1]', 'bg-[#35b9f1]/5'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#35b9f1]', 'bg-[#35b9f1]/5'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-[#35b9f1]', 'bg-[#35b9f1]/5');
              const file = e.dataTransfer.files[0];
              if (file) uploadImage(block.id, file);
            }}
          >
            <div className="w-12 h-12 bg-neutral-800 group-hover/upload:bg-neutral-700 rounded-xl flex items-center justify-center transition-all">
              <ImageIcon className="w-6 h-6 text-neutral-400 group-hover/upload:text-white transition-all" />
            </div>
            <div className="text-center">
              <p className="text-neutral-300 text-sm font-semibold">Click to upload or drag & drop</p>
              <p className="text-neutral-600 text-xs mt-1 font-mono">PNG • JPG • GIF • WEBP • SVG</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) uploadImage(block.id, f); e.target.value = ''; }} />
          </label>
        );

      case 'divider':
        return <hr className="border-0 border-t border-neutral-800 my-1" onClick={() => deleteBlock(block.id)} title="Click to remove" />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[70vh] bg-[#0D1117]" onPaste={handlePaste}>
      <div className="sticky top-0 z-20 bg-[#0D1117]/95 backdrop-blur-md border-b border-neutral-900 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-neutral-500 hover:text-white text-sm font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {uploading && <span className="text-[#35b9f1] text-[11px] font-mono font-bold animate-pulse mr-1">Uploading image...</span>}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-full border border-neutral-800 text-neutral-400 text-sm font-bold hover:border-neutral-600 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="px-5 py-1.5 rounded-full bg-[#35b9f1] text-[#0D1117] text-sm font-extrabold hover:bg-[#10a3e0] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-[#35b9f1]/20"
          >
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>

      <div id="exp-editor-area" className="relative max-w-2xl mx-auto px-6 pt-8 pb-24">
        <style>{`
          #exp-editor-area p { margin: 6px 0; line-height: 1.75; color: #D7DADC; }
          #exp-editor-area h2 { font-size: 1.6rem; font-weight: 800; color: white; margin: 16px 0 6px; }
          #exp-editor-area h3 { font-size: 1.2rem; font-weight: 700; color: #E5E7EB; margin: 12px 0 4px; }
          #exp-editor-area figure { margin: 16px 0; }
          #exp-editor-area figure img { max-width: 100%; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
          #exp-editor-area figcaption { text-align: center; color: #6B7280; font-size: 0.8rem; margin-top: 8px; }
          #exp-editor-area blockquote { border-left: 3px solid #35b9f1; padding-left: 16px; color: #9CA3AF; margin: 12px 0; font-style: italic; }
          #exp-editor-area pre { background: #0A0A0B; border: 1px solid #1F2937; border-radius: 12px; padding: 18px; font-family: monospace; font-size: 0.875rem; overflow-x: auto; margin: 12px 0; }
          #exp-editor-area code { color: #86EFAC; }
          #exp-editor-area ul { list-style: none; margin: 8px 0; }
          #exp-editor-area li { color: #D7DADC; line-height: 1.75; }
          #exp-editor-area hr { border: 0; border-top: 1px solid #1F2937; margin: 24px 0; }
          #exp-editor-area a { color: #35b9f1; text-decoration: underline; }
        `}</style>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center mb-6">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-[#35b9f1]/10 text-[#35b9f1] text-xs font-bold px-2.5 py-1 rounded-full border border-[#35b9f1]/20 font-mono">
              #{tag}
              {(!company || tag !== company) && (
                <button type="button" onClick={() => setTags(prev => prev.filter((_, j) => j !== i))} className="text-[#35b9f1]/50 hover:text-[#35b9f1] cursor-pointer transition-colors">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                e.preventDefault();
                const t = tagInput.trim().replace(/,/g, '');
                if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
                setTagInput('');
              }
            }}
            placeholder="+ Add tag"
            className="bg-transparent border border-dashed border-neutral-800 text-white text-xs px-2.5 py-1 rounded-full focus:outline-none focus:border-[#35b9f1]/40 placeholder-neutral-700 w-24 font-mono transition-colors"
          />
        </div>

        <textarea
          ref={titleRef}
          placeholder="Title*"
          value={title}
          onChange={(e) => { setTitle(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          rows={1}
          className="w-full bg-transparent border-0 text-white text-4xl font-extrabold placeholder-neutral-800 focus:outline-none resize-none mb-8 leading-tight"
          style={{ overflow: 'hidden', minHeight: '52px' }}
        />

        {selFmt && (
          <div
            className="absolute z-30 flex items-center gap-0.5 bg-[#1C1C1E] border border-neutral-700 rounded-xl px-2 py-1.5 shadow-2xl"
            style={{ left: selFmt.x, top: selFmt.y, transform: 'translateX(-50%)' }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {[
              { title: 'Bold', label: 'B', cmd: 'bold', cls: 'font-extrabold' },
              { title: 'Italic', label: 'I', cmd: 'italic', cls: 'italic' },
              { title: 'Underline', label: 'U', cmd: 'underline', cls: 'underline' },
              { title: 'Strikethrough', label: 'S', cmd: 'strikeThrough', cls: 'line-through' },
            ].map(({ title, label, cmd, cls }) => (
              <button
                key={cmd}
                title={title}
                onMouseDown={() => { document.execCommand(cmd); }}
                className={`w-7 h-7 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-700 transition-all cursor-pointer ${cls}`}
              >
                {label}
              </button>
            ))}
            <div className="w-px h-4 bg-neutral-700 mx-0.5" />
            <button
              title="Link"
              onMouseDown={() => {
                const url = prompt('URL:');
                if (url) document.execCommand('createLink', false, url);
              }}
              className="px-2 h-7 rounded-lg text-xs text-neutral-300 hover:text-[#35b9f1] hover:bg-neutral-700 transition-all cursor-pointer font-mono"
            >
              link
            </button>
            <button
              title="Inline code"
              onMouseDown={() => {
                const sel = window.getSelection();
                if (sel?.rangeCount) {
                  const range = sel.getRangeAt(0);
                  const code = document.createElement('code');
                  code.textContent = range.toString();
                  range.deleteContents();
                  range.insertNode(code);
                }
              }}
              className="px-2 h-7 rounded-lg text-xs text-neutral-300 hover:text-green-400 hover:bg-neutral-700 transition-all cursor-pointer font-mono"
            >
              {`</>`}
            </button>
          </div>
        )}

        <div className="space-y-0.5">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="relative flex items-start gap-2 group/row"
              onMouseEnter={() => setHoveredId(block.id)}
              onMouseLeave={() => { setHoveredId(null); setBlockMenuId(null); }}
            >
              <div className="shrink-0 w-8 flex flex-col items-center pt-1 gap-0.5">
                <button
                  type="button"
                  title="Add block"
                  onClick={() => setBlockMenuId(blockMenuId === block.id ? null : block.id)}
                  className="w-6 h-6 rounded-lg text-neutral-700 hover:text-white hover:bg-neutral-800 flex items-center justify-center text-base font-bold cursor-pointer transition-all opacity-0 group-hover/row:opacity-100"
                >
                  +
                </button>
              </div>

              <div className="flex-1 min-w-0 relative py-0.5">
                {renderBlockContent(block, idx)}

                {blockMenuId === block.id && (
                  <div className="absolute left-0 top-8 z-40 bg-[#161618] border border-neutral-800 rounded-2xl shadow-2xl p-2 w-72">
                    <p className="text-neutral-600 text-[10px] font-mono uppercase tracking-widest px-2 pb-2">Insert block after</p>
                    <div className="grid grid-cols-2 gap-1">
                      {BLOCK_TYPES.map(bt => (
                        <button
                          key={bt.type}
                          type="button"
                          onClick={() => {
                            if (bt.type === 'image') {
                              const inp = document.createElement('input');
                              inp.type = 'file'; inp.accept = 'image/*';
                              inp.onchange = (e) => { uploadImage(block.id, e.target.files[0]); };
                              inp.click();
                            } else {
                              addBlock(block.id, bt.type);
                            }
                            setBlockMenuId(null);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-800 transition-all cursor-pointer text-left"
                        >
                          <span className="text-[#35b9f1] text-sm font-bold w-6 text-center shrink-0 font-mono">{bt.emoji}</span>
                          <div>
                            <p className="text-white text-xs font-bold leading-none">{bt.label}</p>
                            <p className="text-neutral-600 text-[10px] mt-0.5">{bt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addBlock(blocks[blocks.length - 1].id, 'text')}
          className="mt-4 flex items-center gap-2 text-neutral-700 hover:text-neutral-400 text-sm transition-all cursor-pointer group/add"
        >
          <span className="w-6 h-6 rounded-lg border border-dashed border-neutral-800 group-hover/add:border-neutral-600 flex items-center justify-center text-base font-bold transition-all">+</span>
          <span className="font-mono text-xs uppercase tracking-wider">Add block</span>
        </button>
      </div>
    </div>
  );
}
