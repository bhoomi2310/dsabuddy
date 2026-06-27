import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Plus, ArrowLeft, Calendar, Send, X, ShieldAlert, ChevronUp, ChevronDown, Bold, Italic, Heading1, Heading2, List, Link, Code, Image as ImageIcon, Trash2 } from 'lucide-react';
import { forumService } from '@/api/services/forumService';
import { Badge, Button, Card, Input } from '@/components/common';
import apiClient from '@/api/client';
import { useUserStore } from '@/store/useUserStore';
import { getErrorMessage } from '@/utils';

// Recursive Comment Node Component
// Recursive Comment Node Component
function CommentNode({ comment, depth = 0, onAddReply, onDeleteComment, formatDate }) {
  const navigate = useNavigate();
  const loggedInUser = useUserStore((state) => state.user);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await onAddReply(comment.id, replyContent);
    setReplyContent('');
    setReplying(false);
  };

  // Helper to count total nested comments recursively
  const countAllReplies = (node) => {
    let count = 0;
    if (node.replies) {
      count += node.replies.length;
      node.replies.forEach(reply => {
        count += countAllReplies(reply);
      });
    }
    return count;
  };

  const totalReplies = countAllReplies(comment);

  return (
    <div 
      className="space-y-3 relative"
      style={{ marginLeft: depth > 0 ? '1.5rem' : '0px' }}
    >
      {/* Left indicator line for depth */}
      {depth > 0 && (
        <div className="absolute top-0 bottom-0 -left-3 w-0.5 bg-[#1F2937] pointer-events-none" />
      )}
      
      {collapsed ? (
        <div className="bg-[#0D1117]/30 border border-[#1F2937]/50 rounded-xl p-3 flex items-center justify-between hover:border-[#35b9f1]/10 transition-all duration-300">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (comment.author?.userName) navigate(`/profile/${comment.author.userName}`);
            }}
          >
            <img
              src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name || 'Anonymous'}`}
              alt="avatar"
              className="w-6 h-6 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5 opacity-50"
            />
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280] font-bold text-xs">{comment.author?.name || 'Anonymous'}</span>
              <span className="text-[#4B5563] text-[9px] font-bold">
                {comment.author?.college || 'NSUT'} • {comment.author?.branch || 'N/A'}
              </span>
              <span className="text-[#4B5563] text-xs font-semibold">
                (Collapsed {totalReplies > 0 ? `• ${totalReplies} replies hidden` : ''})
              </span>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="text-[#35b9f1] hover:text-[#6fd3ff] text-xs font-bold font-Spline-Sans transition-colors flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg bg-[#1F2937]/30 hover:bg-[#1F2937]/50"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            Expand
          </button>
        </div>
      ) : (
        <>
          <Card 
            variant="accent" 
            animated={false} 
            className="p-5 space-y-3 relative hover:border-[#35b9f1]/10 transition-all duration-300 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (comment.author?.userName) navigate(`/profile/${comment.author.userName}`);
                }}
              >
                <img
                  src={comment.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name || 'Anonymous'}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5"
                />
                <div>
                  <span className="text-white font-bold text-sm block leading-none">{comment.author?.name || 'Anonymous'}</span>
                  <span className="text-[#6B7280] text-[10px] font-bold mt-1.5 block">
                    {comment.author?.college || 'NSUT'} • {comment.author?.branch || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#6B7280] text-[10px] font-mono font-bold">
                  {formatDate(comment.createdAt)}
                </span>
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-[#6B7280] hover:text-[#35b9f1] p-1 rounded-lg hover:bg-[#1F2937] transition-all cursor-pointer"
                  title="Collapse thread"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-[#9CA3AF] text-sm leading-relaxed font-Spline-Sans font-medium pl-11">
              {comment.content}
            </p>

            {/* Reply Action Row */}
            <div className="pl-11 pt-1 flex items-center gap-4">
              <button
                onClick={() => setReplying(!replying)}
                className="text-[#35b9f1] hover:text-[#6fd3ff] text-xs font-bold font-Spline-Sans transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
              {(loggedInUser?.id === comment.author?.id || loggedInUser?.role === 'admin') && (
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this comment?")) {
                      onDeleteComment(comment.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-400 text-xs font-bold font-Spline-Sans transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>

            {/* Inline Reply Input */}
            {replying && (
              <form onSubmit={handleReplySubmit} className="pl-11 pt-2 flex gap-3 items-center">
                <Input
                  type="text"
                  placeholder={`Reply to ${comment.author?.name || 'Anonymous'}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1"
                  inputClassName="py-2 text-xs border-[#1F2937]/30 bg-[#0D1117] rounded-lg"
                  autoFocus
                />
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    onClick={() => setReplying(false)}
                    variant="outline"
                    size="sm"
                    className="px-2.5 py-1.5 rounded-lg border-[#1F2937] text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!replyContent.trim()}
                    variant="accent"
                    size="sm"
                    className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Render nested replies recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 pt-1">
              {comment.replies.map((reply) => (
                <CommentNode 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1} 
                  onAddReply={onAddReply} 
                  onDeleteComment={onDeleteComment}
                  formatDate={formatDate} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const sanitizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  // Block javascript:, data:, and vbscript: protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  // Only allow http:, https:, and relative URLs
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
  
  // 1. Escape HTML to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Parse Headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-white text-lg font-bold mt-4 mb-2 font-Spline-Sans">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-white text-xl font-bold mt-4 mb-2 font-Spline-Sans">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-white text-2xl font-bold mt-4 mb-2 font-Spline-Sans">$1</h1>');

  // 3. Parse Code blocks: ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-[#0D1117] border border-[#1F2937] rounded-xl p-4 font-mono text-xs my-4 overflow-x-auto text-gray-300">$1</pre>');

  // 4. Parse Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-[#0D1117] border border-[#1F2937] rounded px-1.5 py-0.5 font-mono text-xs text-[#FF453A]">$1</code>');

  // 5. Parse Images: ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return '[Invalid Image URL]';
    return `<div class="my-4 flex justify-center"><img src="${escapeAttr(safeUrl)}" alt="${escapeAttr(alt)}" class="max-w-full rounded-xl object-contain max-h-[400px] border border-[#1F2937] shadow-lg" /></div>`;
  });

  // 6. Parse Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) return text;
    return `<a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" class="text-[#35b9f1] hover:underline">${text}</a>`;
  });

  // 7. Parse Bold: **text**
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');

  // 8. Parse Italic: *text* or _text_
  html = html.replace(/\*([\s\S]*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([\s\S]*?)_/g, '<em>$1</em>');

  // 9. Bullet lists
  html = html.replace(/^\s*[-*+]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-gray-300 font-Spline-Sans">$1</li>');

  // 10. Convert newlines to breaks
  html = html.replace(/\n/g, '<br />');

  return html;
};

export function InterviewForum() {
  const navigate = useNavigate();
  const loggedInUser = useUserStore((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postError, setPostError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [activeTab, setActiveTab] = useState('write');
  const [isDragging, setIsDragging] = useState(false);

  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.getElementById('post-content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    setPostContent(
      text.substring(0, start) +
      replacement +
      text.substring(end)
    );

    // Reset selection/focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const uploadFile = async (file) => {
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploadingImage(true);
      setPostError('');
      const res = await apiClient.post('/upload/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const url = res?.url || res?.data?.url;
      if (url) {
        insertMarkdown(`![${file.name}](${url})`);
      } else {
        setPostError("Failed to upload image. No URL was returned from the server.");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      setPostError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
  };

  const handleKeyDown = (e) => {
    // Bold: Cmd/Ctrl + B
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**');
    }
    // Italic: Cmd/Ctrl + I
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*');
    }
    // Inline code: Cmd/Ctrl + E
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      insertMarkdown('`', '`');
    }
  };

  // Comment state
  const [commentContent, setCommentContent] = useState('');

  const popularTags = [
    'Google', 'Amazon', 'Uber', 'Microsoft', 'Apple', 
    'SWE', 'System Design', 'FTE', 'Internship', 'HR Round', 
    'On-Campus', 'Off-Campus'
  ];

  // Helper to build comment hierarchy
  const buildCommentTree = (flatComments) => {
    if (!flatComments) return [];
    const map = {};
    const tree = [];
    
    // Initialise map
    flatComments.forEach(comment => {
      map[comment.id] = { ...comment, replies: [] };
    });
    
    // Build tree
    flatComments.forEach(comment => {
      if (comment.parentId && map[comment.parentId]) {
        map[comment.parentId].replies.push(map[comment.id]);
      } else {
        tree.push(map[comment.id]);
      }
    });
    
    return tree;
  };

  // Fetch posts with filters
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedTag) filters.tag = selectedTag;

      const data = await forumService.getPosts(filters);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedTag]);

  // Fetch full post detail when selected
  const fetchPostDetail = async (id) => {
    try {
      setLoading(true);
      const data = await forumService.getPost(id);
      setSelectedPost(data.post);
    } catch (err) {
      console.error('Failed to fetch post details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Vote Post (value: 1 for upvote, -1 for downvote)
  const handleVote = async (e, postId, value) => {
    e.stopPropagation();
    try {
      const data = await forumService.votePost(postId, value);
      
      // Update local states
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          userVote: data.userVote,
          score: data.score,
          upvoteCount: data.score,
          isUpvoted: data.userVote === 1
        }));
      }

      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            userVote: data.userVote,
            score: data.score,
            upvoteCount: data.score,
            isUpvoted: data.userVote === 1
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to update vote:', err);
    }
  };

  // Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      setPostError('Title and Content are required.');
      return;
    }

    try {
      setSubmittingPost(true);
      setPostError('');
      const data = await forumService.createPost({
        title: postTitle,
        content: postContent,
        tags: postTags
      });

      // Insert new post at top of list
      setPosts(prev => [data.post, ...prev]);
      
      // Reset state and close modal
      setPostTitle('');
      setPostContent('');
      setPostTags('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to publish post:', err);
      setPostError(getErrorMessage(err));
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await forumService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setSelectedPost(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedPost) return;
    try {
      await forumService.deleteComment(commentId);
      
      const getDescendantIds = (cId, allComments) => {
        const directChildren = allComments.filter(c => c.parentId === cId);
        let ids = [cId];
        for (const child of directChildren) {
          ids = [...ids, ...getDescendantIds(child.id, allComments)];
        }
        return ids;
      };

      const descendantIds = getDescendantIds(commentId, selectedPost.comments || []);
      const countDeleted = descendantIds.length;

      setSelectedPost(prev => ({
        ...prev,
        comments: (prev.comments || []).filter(c => !descendantIds.includes(c.id)),
      }));

      setPosts(prev => prev.map(p => {
        if (p.id === selectedPost.id) {
          return {
            ...p,
            commentCount: Math.max(0, (p.commentCount || 0) - countDeleted),
          };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Add Comment or Reply
  const handleAddCommentOrReply = async (parentId, content) => {
    try {
      const data = await forumService.addComment(selectedPost.id, {
        content,
        parentId
      });

      setSelectedPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), data.comment]
      }));

      // Update post in the list to reflect comment count increment
      setPosts(prev => prev.map(p => {
        if (p.id === selectedPost.id) {
          return { ...p, commentCount: (p.commentCount || 0) + 1 };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to add comment/reply:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      await handleAddCommentOrReply(null, commentContent);
      setCommentContent('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const truncateText = (text, maxLength = 220) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getPostPreviewText = (text) => {
    if (!text) return '';
    // Strip image links
    let clean = text.replace(/!\[.*?\]\(.*?\)/g, '[Image]');
    // Strip standard links
    clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    // Strip code blocks
    clean = clean.replace(/```[\s\S]*?```/g, '[Code Block]');
    // Strip inline code
    clean = clean.replace(/`([^`\n]+)`/g, '$1');
    // Strip formatting tags
    clean = clean.replace(/\*\*([\s\S]*?)\*\*/g, '$1');
    clean = clean.replace(/\*([\s\S]*?)\*/g, '$1');
    clean = clean.replace(/_([\s\S]*?)_/g, '$1');
    // Strip headings
    clean = clean.replace(/^#+\s+/gm, '');

    return truncateText(clean);
  };

  const commentTree = selectedPost ? buildCommentTree(selectedPost.comments) : [];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Detail Post View */}
      {selectedPost ? (
        <div className="space-y-6">
          <Button
            onClick={() => { setSelectedPost(null); fetchPosts(); }}
            variant="outline"
            size="sm"
            className="text-[#9CA3AF] hover:text-white border-none bg-transparent hover:bg-neutral-900/40 px-3 py-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Button>

          <Card variant="default" animated={false} className="rounded-2xl p-6 md:p-8 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F2937] pb-6">
              <div 
                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (selectedPost.author?.userName) navigate(`/profile/${selectedPost.author.userName}`);
                }}
              >
                <img
                  src={selectedPost.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPost.author?.name || 'Anonymous'}`}
                  alt="avatar"
                  className="w-12 h-12 rounded-xl bg-[#0D1117] border border-[#1F2937] p-0.5"
                />
                <div>
                  <h4 className="text-white font-extrabold text-base font-Spline-Sans leading-snug">
                    {selectedPost.author?.name || 'Anonymous'}
                  </h4>
                  <p className="text-[#6B7280] text-xs font-semibold mt-0.5 font-Spline-Sans">
                    {selectedPost.author?.college || 'NSUT'} • {selectedPost.author?.branch || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-semibold font-mono">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedPost.createdAt)}
                </div>
                {(loggedInUser?.id === selectedPost.author?.id || loggedInUser?.role === 'admin') && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this experience post? This will delete all comments and cannot be undone.")) {
                        handleDeletePost(selectedPost.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-400 p-2 rounded-xl bg-[#0D1117] border border-[#1F2937] hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Title & Tags */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight font-Spline-Sans">
                {selectedPost.title}
              </h1>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedPost.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    onClick={() => { setSelectedTag(tag); setSelectedPost(null); }}
                    className="bg-[#0D1117] hover:bg-[#1F2937] cursor-pointer text-[#35b9f1] border border-[#1F2937] font-bold text-xs px-2.5 py-0.5"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Post Content */}
            <div 
              className="text-[#E5E7EB] text-base leading-relaxed space-y-4 font-medium font-Spline-Sans"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(selectedPost.content) }}
            />

            {/* Voting and Comments Footer */}
            <div className="flex items-center gap-4 border-t border-b border-[#1F2937] py-4">
              <div className="flex items-center bg-[#0D1117] border border-[#1F2937] rounded-xl p-1 gap-1">
                <button
                  onClick={(e) => handleVote(e, selectedPost.id, 1)}
                  className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedPost.userVote === 1
                      ? 'text-[#35b9f1] bg-[#35b9f1]/10'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#161B22]'
                  }`}
                  title="Upvote"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                
                <span className={`px-2 font-mono font-bold text-sm min-w-[20px] text-center ${
                  selectedPost.userVote === 1
                    ? 'text-[#35b9f1]'
                    : selectedPost.userVote === -1
                    ? 'text-red-500'
                    : 'text-[#E5E7EB]'
                }`}>
                  {selectedPost.score || 0}
                </span>

                <button
                  onClick={(e) => handleVote(e, selectedPost.id, -1)}
                  className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    selectedPost.userVote === -1
                      ? 'text-red-500 bg-red-500/10'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#161B22]'
                  }`}
                  title="Downvote"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-[#9CA3AF] text-sm font-semibold font-mono pl-2">
                <MessageSquare className="w-4 h-4" />
                {selectedPost.comments?.length || 0} Comments
              </div>
            </div>

            {/* Comments Area */}
            <div className="space-y-6 pt-2">
              <h3 className="text-lg font-extrabold text-white font-Spline-Sans">Comments</h3>
              
              {/* Comment submission form */}
              <form onSubmit={handleAddComment} className="flex gap-4">
                <textarea
                  placeholder="Share your thoughts or ask a question..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 min-h-[48px] max-h-[160px] bg-[#0D1117] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#35b9f1]/30 transition-all font-Spline-Sans"
                  rows={2}
                />
                <Button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 flex items-center justify-center cursor-pointer transition-all self-end h-[48px]"
                >
                  {submittingComment ? 'Posting...' : <Send className="w-4 h-4" />}
                </Button>
              </form>

              {/* Threaded Comments list */}
              <div className="space-y-6 pt-2">
                {commentTree && commentTree.length > 0 ? (
                  commentTree.map((comment) => (
                    <CommentNode 
                      key={comment.id} 
                      comment={comment} 
                      onAddReply={handleAddCommentOrReply}
                      onDeleteComment={handleDeleteComment}
                      formatDate={formatDate}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 bg-[#0D1117]/30 border border-dashed border-[#1F2937] rounded-xl">
                    <p className="text-[#6B7280] font-mono text-xs">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>

          </Card>
        </div>
      ) : (
        
        // Listing view
        <div className="space-y-8">
          
          {/* Title Banner */}
          <Card variant="default" animated={false} className="rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-lg border-[#1F2937]">
            <div className="absolute inset-0 bg-[#0D1117]/10 backdrop-blur-[2px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#35b9f1]/10 via-[#35b9f1]/3 to-transparent opacity-30 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-white text-4xl font-normal italic mb-2 font-Instrument-Serif">
                  Interview Experiences Forum
                </h1>
                <p className="text-[#9CA3AF] text-sm font-medium">
                  Read, search, and share real placement and internship interview journeys from students.
                </p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-5 py-3 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[#35b9f1]/10 transition-all font-Spline-Sans"
              >
                <Plus className="w-5 h-5" />
                Share Experience
              </Button>
            </div>
          </Card>

          {/* Search & Select tag filtering */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              className="w-full md:w-80"
              inputClassName="py-2.5 bg-[#161B22] border-[#1F2937] rounded-xl"
            />
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-start md:justify-end">
              <span className="text-[#6B7280] text-xs font-bold font-mono mr-2">Filter Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-[#161B22] border border-[#1F2937] rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#35b9f1]/30 cursor-pointer"
              >
                <option value="">All Tags</option>
                {popularTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
              {selectedTag && (
                <Button
                  onClick={() => setSelectedTag('')}
                  variant="outline"
                  size="sm"
                  className="p-2.5 hover:bg-[#161B22] rounded-xl border-[#1F2937] text-red-400 hover:text-red-300 h-[38px] flex items-center justify-center"
                  title="Clear tag filter"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#161B22]">
            <span className="text-[10px] font-bold font-mono text-[#6B7280] uppercase tracking-wider block shrink-0 mr-2">Quick Tags:</span>
            {popularTags.slice(0, 8).map(tag => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isActive ? '' : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#35b9f1]/10 border-[#35b9f1] text-[#35b9f1]'
                      : 'bg-[#161B22] border-[#1F2937] text-[#9CA3AF] hover:text-white hover:border-[#1F2937]/80'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          {/* Posts Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                variant="default"
                onClick={() => fetchPostDetail(post.id)}
                className="p-6 flex flex-col justify-between cursor-pointer hover:border-[#35b9f1]/20 rounded-2xl w-full h-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        if (post.author?.userName) {
                          e.stopPropagation();
                          navigate(`/profile/${post.author.userName}`);
                        }
                      }}
                    >
                      <img
                        src={post.author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'Anonymous'}`}
                        alt="avatar"
                        className="w-9 h-9 rounded-lg bg-[#0D1117] border border-[#1F2937] p-0.5"
                      />
                      <div>
                        <span className="text-white font-bold text-sm block leading-none">
                          {post.author?.name || 'Anonymous'}
                        </span>
                        <span className="text-[#6B7280] text-[10px] font-bold mt-1 block">
                          {post.author?.college || 'NSUT'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#6B7280] text-[10px] font-mono font-bold">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg leading-snug group-hover:text-[#35b9f1] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed line-clamp-3 font-Spline-Sans font-medium">
                      {getPostPreviewText(post.content)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#1F2937] pt-4 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags?.slice(0, 3).map(tag => (
                      <Badge
                        key={tag}
                        className="bg-[#0D1117] text-[#9CA3AF] border border-[#1F2937] text-[10px] font-bold px-2 py-0.5"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Voting control on list card */}
                      <div className="flex items-center bg-[#0D1117] border border-[#1F2937] rounded-lg p-0.5 gap-0.5">
                        <button
                          onClick={(e) => handleVote(e, post.id, 1)}
                          className={`p-1 rounded transition-all duration-200 cursor-pointer ${
                            post.userVote === 1
                              ? 'text-[#35b9f1] bg-[#35b9f1]/10'
                              : 'text-[#9CA3AF] hover:text-white hover:bg-[#161B22]'
                          }`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        
                        <span className={`px-1.5 font-mono font-bold text-xs min-w-[14px] text-center ${
                          post.userVote === 1
                            ? 'text-[#35b9f1]'
                            : post.userVote === -1
                            ? 'text-red-500'
                            : 'text-[#E5E7EB]'
                        }`}>
                          {post.score || 0}
                        </span>

                        <button
                          onClick={(e) => handleVote(e, post.id, -1)}
                          className={`p-1 rounded transition-all duration-200 cursor-pointer ${
                            post.userVote === -1
                              ? 'text-red-500 bg-red-500/10'
                              : 'text-[#9CA3AF] hover:text-white hover:bg-[#161B22]'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[#6B7280] text-xs font-semibold font-mono">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.commentCount || 0}
                      </div>
                    </div>

                    <span className="text-[#35b9f1] text-xs font-extrabold group-hover:underline flex items-center gap-1 font-Spline-Sans">
                      Read Experience
                    </span>
                  </div>
                </div>

              </Card>
            ))}

            {loading && (
              <div className="col-span-full py-16 flex items-center justify-center text-[#9CA3AF] font-mono text-sm">
                Loading forum experiences...
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-[#161B22]/30 rounded-2xl border border-dashed border-[#1F2937]">
                <p className="text-[#6B7280] font-mono text-sm">No experiences found matching filters.</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-extrabold rounded-xl px-4 py-2 transition-all text-xs"
                >
                  Share Your Experience
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#161B22] border border-[#1F2937] rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[800px]">
            
            <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-4">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-extrabold text-lg font-Spline-Sans">Share Interview Experience</h3>
                
                {/* Write vs Preview Tabs */}
                <div className="flex bg-[#0D1117] border border-[#1F2937] rounded-lg p-0.5 ml-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === 'write'
                        ? 'bg-[#35b9f1] text-[#0D1117]'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-[#35b9f1] text-[#0D1117]'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#6B7280] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="flex-1 flex flex-col overflow-hidden">
              
              <div className="p-6 space-y-5 flex-1 overflow-y-auto flex flex-col min-h-0">
                {postError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{postError}</span>
                  </div>
                )}

                <Input
                  label="Experience Title"
                  type="text"
                  placeholder="e.g. Google SWE FTE Interview Experience (On-Campus)"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  labelClassName="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5 block normal-case"
                  inputClassName="py-3 bg-[#0D1117] border-[#1F2937] rounded-xl focus:border-[#35b9f1]/30"
                  required
                  className="shrink-0"
                />

                {activeTab === 'write' ? (
                  <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Describe Your Journey</label>
                      
                      {/* Formatting Toolbar */}
                      <div className="flex flex-wrap items-center justify-between bg-[#0D1117] border border-[#1F2937] border-b-0 rounded-t-xl px-3 py-2 animate-fadeIn select-none shrink-0">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => insertMarkdown('**', '**')}
                            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer"
                            title="Bold (Cmd+B / Ctrl+B)"
                          >
                            <Bold className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('*', '*')}
                            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer"
                            title="Italic (Cmd+I / Ctrl+I)"
                          >
                            <Italic className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('# ')}
                            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer"
                            title="Heading 1"
                          >
                            <Heading1 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('## ')}
                            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer"
                            title="Heading 2"
                          >
                            <Heading2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('- ')}
                            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer"
                            title="Bullet List"
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('`', '`')}
                            className="px-2 py-1 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer text-xs font-mono font-bold"
                            title="Inline Code (Cmd+E / Ctrl+E)"
                          >
                            &lt;&gt;
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdown('```\n', '\n```')}
                            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer"
                            title="Code Block"
                          >
                            <Code className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const url = prompt('Enter link URL:');
                              if (url) insertMarkdown('[', `](${url})`);
                            }}
                            className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer"
                            title="Insert Link"
                          >
                            <Link className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Photo Upload indicator/button */}
                        <div className="flex items-center gap-2">
                          {uploadingImage && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#35b9f1] animate-pulse pr-1">
                              <span className="h-1.5 w-1.5 bg-[#35b9f1] rounded-full animate-ping" />
                              Uploading Image...
                            </div>
                          )}
                          <label className="p-1.5 text-[#9CA3AF] hover:text-white hover:bg-[#161B22] rounded transition-all cursor-pointer flex items-center justify-center gap-1.5">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                          </label>
                        </div>
                      </div>

                      {/* Text editor dropzone */}
                      <div 
                        className={`relative flex-1 flex flex-col rounded-b-xl border transition-all duration-300 min-h-0 ${
                          isDragging 
                            ? 'border-[#35b9f1] bg-[#35b9f1]/5 shadow-inner' 
                            : 'border-[#1F2937] bg-[#0D1117] hover:border-[#1F2937]/80'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {isDragging && (
                          <div className="absolute inset-0 bg-[#0D1117]/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-[#35b9f1] rounded-b-xl pointer-events-none animate-fadeIn">
                            <ImageIcon className="w-8 h-8 text-[#35b9f1] animate-bounce" />
                            <p className="text-xs font-bold text-[#35b9f1] font-Spline-Sans uppercase tracking-wider">Drop image to upload</p>
                          </div>
                        )}
                        <textarea
                          id="post-content-textarea"
                          placeholder="Outline the rounds, types of questions asked (e.g. graphs, DP), eligibility criteria, behavioral questions, and preparation tips..."
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-4 py-3 text-sm text-white font-Spline-Sans resize-none overflow-y-auto"
                          required
                        />
                      </div>
                      <span className="text-[10px] text-[#6B7280] font-mono mt-1 shrink-0">
                        Tip: Drag & drop images directly or use Ctrl/Cmd+B, Ctrl/Cmd+I shortcuts.
                      </span>
                    </div>

                    <Input
                      label="Filter Tags (Comma separated)"
                      type="text"
                      placeholder="e.g. Google, SWE, Internship, On-Campus"
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      labelClassName="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5 block normal-case"
                      inputClassName="py-3 bg-[#0D1117] border-[#1F2937] rounded-xl focus:border-[#35b9f1]/30"
                      className="shrink-0"
                    />
                    <span className="text-[10px] text-[#6B7280] block font-mono mt-1">
                      Separate tags with commas. Popular: Google, Amazon, System Design, HR Round.
                    </span>
                  </div>
                ) : (
                  /* Live Preview Tab */
                  <div className="flex-1 flex flex-col min-h-0 space-y-2">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0">Live Preview</label>
                    <div className="flex-1 bg-[#0D1117] border border-[#1F2937] rounded-xl p-5 overflow-y-auto min-h-0">
                      {postContent.trim() ? (
                        <div 
                          className="text-[#E5E7EB] text-sm leading-relaxed space-y-4 font-medium font-Spline-Sans"
                          dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(postContent) }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <MessageSquare className="w-8 h-8 text-[#6B7280] mb-2 opacity-55 animate-pulse" />
                          <p className="text-gray-500 text-xs italic font-mono">Nothing to preview yet. Start writing in the editor tab!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              <div className="flex gap-3 justify-end p-6 border-t border-[#1F2937] bg-[#161B22] shrink-0">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  size="sm"
                  className="px-5 py-2.5 rounded-xl border-[#1F2937] text-sm font-extrabold text-[#9CA3AF] hover:text-white transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingPost}
                  variant="accent"
                  size="sm"
                  className="rounded-xl px-6 py-2.5 font-extrabold"
                >
                  {submittingPost ? 'Publishing...' : 'Publish Experience'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
