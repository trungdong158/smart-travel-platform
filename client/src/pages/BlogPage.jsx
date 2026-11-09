import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, Heart, MessageCircle, Share2, Send, 
  Sparkles, Plus, MapPin, Calendar, ArrowRight, 
  Smile, Image as ImageIcon, X, CheckCircle2, 
  Loader2, Compass, Upload, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { blogService } from '../services/api';
import { formatVND } from '../utils/format';

// Danh sách các mood cảm xúc du lịch cho bài viết
const BLOG_MOODS = [
  { id: 'all', label: 'Tất cả cảm xúc', emoji: '✨' },
  { id: 'healing', label: 'Chữa Lành & Tĩnh Tại', emoji: '🌿', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
  { id: 'adventure', label: 'Phiêu Lưu & Khám Phá', emoji: '⛰️', color: 'from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  { id: 'romance', label: 'Lãng Mạn & Hoài Niệm', emoji: '🌸', color: 'from-rose-500/10 to-pink-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700' },
  { id: 'chill', label: 'Nghỉ Dưỡng & Chill Out', emoji: '🌊', color: 'from-sky-500/10 to-blue-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700' },
  { id: 'culture', label: 'Văn Hóa & Bản Sắc', emoji: '🏮', color: 'from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700' },
];

// Mẫu ảnh du lịch nhanh cho người dùng chọn khi tạo bài viết
const QUICK_IMAGE_PRESETS = [
  { label: 'Núi mây Sa Pa', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Phố cổ Hội An', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Biển xanh Phú Quốc', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Đèo Mã Pí Lèng', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Rừng thông Đà Lạt', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sông nước Cần Thơ', url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80' }
];

// Helper nén ảnh du lịch từ thiết bị để tải nhanh & không quá tải dung lượng
function resizeTripImage(file, maxWidth = 1280, maxHeight = 850, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP)!'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Không thể đọc file ảnh đã chọn!'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file từ thiết bị!'));
    reader.readAsDataURL(file);
  });
}

export default function BlogPage({ tours = [] }) {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const requestedBlogId = searchParams.get('id');

  // State danh sách bài viết & phân trang Infinite Scroll
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('all');
  const [highlightedBlogId, setHighlightedBlogId] = useState(null);

  // State Modal Viết bài mới & Nạp ảnh từ thiết bị
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newMood, setNewMood] = useState('healing');
  const [newTourId, setNewTourId] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // State Bình luận & Tương tác
  const [activeCommentBlogId, setActiveCommentBlogId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [guestNameInput, setGuestNameInput] = useState('');
  const [submittingCommentBlogId, setSubmittingCommentBlogId] = useState(null);

  // Sentinel Ref cho IntersectionObserver
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!requestedBlogId) return undefined;
    let ignore = false;

    blogService.getBlogById(requestedBlogId)
      .then((blog) => {
        if (ignore || !blog) return;
        setBlogs((previousBlogs) => (
          previousBlogs.some((item) => String(item.id) === String(blog.id))
            ? previousBlogs
            : [blog, ...previousBlogs]
        ));
        setHighlightedBlogId(String(blog.id));
      })
      .catch(() => {
        if (!ignore) showToast('Không tìm thấy bài viết được chia sẻ!', 'error');
      });

    return () => {
      ignore = true;
    };
  }, [requestedBlogId, showToast]);

  useEffect(() => {
    if (
      isInitialLoading ||
      !highlightedBlogId ||
      !blogs.some((blog) => String(blog.id) === highlightedBlogId)
    ) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`blog-post-${highlightedBlogId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [highlightedBlogId, blogs, isInitialLoading]);

  // Tải danh sách bài viết ban đầu hoặc khi người dùng thay đổi bộ lọc Mood
  useEffect(() => {
    let ignore = false;
    const fetchBlogs = async () => {
      try {
        const params = { page: 1, limit: 2 };
        if (selectedMood && selectedMood !== 'all') {
          params.mood = selectedMood;
        }
        const res = await blogService.getAllBlogs(params);
        if (!ignore && res && res.success) {
          const fetchedBlogs = res.data || [];
          setBlogs((previousBlogs) => {
            if (!requestedBlogId) return fetchedBlogs;
            const fetchedIds = new Set(fetchedBlogs.map((blog) => String(blog.id)));
            return [
              ...fetchedBlogs,
              ...previousBlogs.filter((blog) => !fetchedIds.has(String(blog.id)))
            ];
          });
          setPage(1);
          setHasMore(res.pagination ? res.pagination.hasMore : false);
        }
      } catch {
        if (!ignore) {
          showToast('Không thể tải bài viết du lịch lúc này!', 'error');
        }
      } finally {
        if (!ignore) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchBlogs();
    return () => {
      ignore = true;
    };
  }, [selectedMood, showToast, requestedBlogId]);

  // Hàm tải thêm bài viết (Infinite Scroll - Nối tiếp, KHÔNG XÓA bài cũ)
  const loadMoreBlogs = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const nextPage = page + 1;
    try {
      const params = { page: nextPage, limit: 2 };
      if (selectedMood && selectedMood !== 'all') {
        params.mood = selectedMood;
      }

      const res = await blogService.getAllBlogs(params);
      if (res && res.success) {
        const newItems = res.data || [];
        
        // Nối tiếp bài viết mới vào dưới, đảm bảo không trùng lặp và giữ nguyên bài trước
        setBlogs((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        });

        setPage(nextPage);
        setHasMore(res.pagination ? res.pagination.hasMore : false);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, selectedMood]);

  // Cài đặt IntersectionObserver để kích hoạt Infinite Scroll
  useEffect(() => {
    if (!hasMore || isLoading || isInitialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreBlogs();
        }
      },
      { rootMargin: '150px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, isLoading, isInitialLoading, loadMoreBlogs]);

  // Xử lý Thả tim (Like)
  const handleToggleLike = async (blogId) => {
    const userId = currentUser ? currentUser.id : 'guest_user';
    
    // Cập nhật Optimistic UI ngay lập tức
    setBlogs((prev) =>
      prev.map((b) => {
        if (b.id !== blogId) return b;
        const likedIds = Array.isArray(b.likedUserIds) ? [...b.likedUserIds] : [];
        const isCurrentlyLiked = likedIds.some((uid) => String(uid) === String(userId));
        const newLikes = isCurrentlyLiked ? Math.max(0, b.likes - 1) : b.likes + 1;
        const newLikedIds = isCurrentlyLiked
          ? likedIds.filter((uid) => String(uid) !== String(userId))
          : [...likedIds, userId];
        return {
          ...b,
          likes: newLikes,
          likedUserIds: newLikedIds
        };
      })
    );

    try {
      await blogService.toggleLike(blogId, { userId });
    } catch {
      // rollback nếu lỗi mạng
    }
  };

  // Xử lý Gửi bình luận
  const handleAddComment = async (blogId, e) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      showToast('Vui lòng nhập nội dung bình luận!', 'error');
      return;
    }

    setSubmittingCommentBlogId(blogId);
    try {
      const commentPayload = {
        content: commentInput.trim(),
        userName: currentUser ? currentUser.fullName : (guestNameInput.trim() || 'Du khách thân mến')
      };

      const res = await blogService.addComment(blogId, commentPayload);
      if (res && res.success) {
        showToast('Đã gửi bình luận của bạn!', 'success');
        
        // Cập nhật bình luận trực tiếp vào state của bài viết
        setBlogs((prev) =>
          prev.map((b) => {
            if (b.id !== blogId) return b;
            const updatedComments = Array.isArray(b.comments) ? [...b.comments, res.data] : [res.data];
            return {
              ...b,
              comments: updatedComments
            };
          })
        );

        setCommentInput('');
      }
    } catch {
      showToast('Không thể gửi bình luận lúc này!', 'error');
    } finally {
      setSubmittingCommentBlogId(null);
    }
  };

  // Xử lý Mở Modal Đăng bài
  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để viết bài chia sẻ kỷ niệm du lịch!', 'info');
      openAuthModal();
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Xử lý nạp ảnh từ thiết bị
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showToast('Đang nạp và xử lý hình ảnh từ thiết bị...', 'info');

    try {
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const base64 = await resizeTripImage(file);
          newImages.push(base64);
        }
      }

      if (newImages.length > 0) {
        setUploadedImages((prev) => [...prev, ...newImages].slice(0, 6));
        showToast(`Đã thêm thành công ${newImages.length} hình ảnh từ thiết bị!`, 'success');
      } else {
        showToast('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP)!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Lỗi khi xử lý hình ảnh từ thiết bị!', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Xóa bớt ảnh đã chọn
  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Thêm ảnh từ URL ngoài
  const handleAddUrlImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) {
      showToast('Vui lòng dán link hình ảnh!', 'error');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      showToast('Link hình ảnh phải bắt đầu bằng http:// hoặc https://', 'error');
      return;
    }
    setUploadedImages((prev) => [...prev, trimmed].slice(0, 6));
    setNewImageUrl('');
    showToast('Đã thêm hình ảnh từ liên kết!', 'success');
  };

  // Chọn nhanh ảnh mẫu
  const handleSelectPreset = (url) => {
    setUploadedImages((prev) => [...prev, url].slice(0, 6));
    showToast('Đã thêm ảnh mẫu vào bài viết!', 'info');
  };

  // Xử lý Gửi bài viết mới
  const handleCreateBlogSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('Tiêu đề và nội dung bài viết không được để trống!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const matchedMoodObj = BLOG_MOODS.find((m) => m.id === newMood);
      const finalImages = uploadedImages.length > 0 ? uploadedImages : [QUICK_IMAGE_PRESETS[0].url];
      const blogPayload = {
        title: newTitle.trim(),
        content: newContent.trim(),
        location: newLocation.trim() || 'Việt Nam',
        mood: newMood,
        moodLabel: matchedMoodObj ? matchedMoodObj.label : 'Chữa Lành & Tĩnh Tại',
        tourId: newTourId || null,
        images: finalImages
      };

      const res = await blogService.createBlog(blogPayload);
      if (res && res.success) {
        showToast('🎉 Đăng bài viết chia sẻ thành công!', 'success');
        
        // Chèn ngay bài viết mới lên đầu danh sách bài viết hiện tại
        setBlogs((prev) => [res.data, ...prev]);

        // Đặt lại form và đóng modal
        setNewTitle('');
        setNewContent('');
        setNewLocation('');
        setNewMood('healing');
        setNewTourId('');
        setUploadedImages([]);
        setNewImageUrl('');
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi đăng bài viết!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper chia sẻ liên kết
  const handleSharePost = async (blog) => {
    const shareUrl = new URL('/blog', window.location.origin);
    shareUrl.searchParams.set('id', blog.id);

    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl.toString());
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        const temporaryInput = document.createElement('textarea');
        temporaryInput.value = shareUrl.toString();
        temporaryInput.setAttribute('readonly', '');
        temporaryInput.style.position = 'fixed';
        temporaryInput.style.opacity = '0';
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        copied = document.execCommand('copy');
        temporaryInput.remove();
      }
      if (!copied) throw new Error('Clipboard access is unavailable');
      showToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm!', 'success');
    } catch {
      showToast('Không thể sao chép liên kết. Vui lòng kiểm tra quyền truy cập clipboard của trình duyệt!', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* ================= HERO HEADER BLOG ================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-6 sm:p-10 shadow-xl border border-amber-400/30">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Nhật Ký SoulTrip • Chuyện Những Chuyến Đi</span>
              </div>
              
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-normal leading-snug">
                Nơi Cảm Xúc Hòa Nhịp Cùng Những Cung Đường
              </h1>
              
              <p className="text-amber-100/90 text-xs sm:text-sm font-light leading-relaxed">
                Chia sẻ những kỉ niệm vui buồn, khoảnh khắc chữa lành và kinh nghiệm chân thực nhất từ cộng đồng lữ khách SoulTrip.
              </p>
            </div>

            {/* Nút Viết Bài Chia Sẻ */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-stone-900 font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Plus className="w-4 h-4 text-orange-600 group-hover:rotate-90 transition-transform duration-300" />
                <span>Viết bài chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= BỘ LỌC CẢM XÚC (MOOD FILTER PILLS) ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {BLOG_MOODS.map((m) => {
            const isActive = selectedMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  if (selectedMood !== m.id) {
                    setSelectedMood(m.id);
                    setIsInitialLoading(true);
                  }
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= DANH SÁCH BÀI VIẾT (INFINITE SCROLL FEED) ================= */}
        {isInitialLoading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Compass className="w-12 h-12 mx-auto text-amber-500 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Chưa có bài viết nào thuộc cảm xúc này</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Hãy là người đầu tiên chia sẻ cảm xúc và kỷ niệm du lịch tuyệt vời của bạn tới mọi người!
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition"
            >
              Viết bài ngay
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {blogs.map((blog) => {
              const isLiked = Array.isArray(blog.likedUserIds) && currentUser && blog.likedUserIds.some((uid) => String(uid) === String(currentUser.id));
              const isCommentsOpen = activeCommentBlogId === blog.id;

              return (
                <article 
                  key={blog.id}
                  id={`blog-post-${blog.id}`}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain flex flex-col ${
                    highlightedBlogId === String(blog.id)
                      ? 'border-amber-400 ring-2 ring-amber-300/60'
                      : 'border-slate-200/90 dark:border-slate-800'
                  }`}
                >
                  {/* Tác giả & Header bài viết */}
                  <div className="p-5 sm:p-7 pb-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {blog.author?.avatar ? (
                          <img 
                            src={blog.author.avatar} 
                            alt={blog.author.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400/40" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-base shadow">
                            {blog.author?.name ? blog.author.name.charAt(0) : 'U'}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            {blog.author?.name || 'Du Khách SoulTrip'}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {blog.author?.role === 'ADMIN' ? 'Ban Quản Trị' : 'Thành viên SoulTrip'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span>{blog.location || 'Việt Nam'}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mood Badge */}
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                        <span>{BLOG_MOODS.find((m) => m.id === blog.mood)?.emoji || '✨'}</span>
                        <span className="hidden sm:inline">{blog.moodLabel || 'Cảm xúc du lịch'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Nội dung bài viết */}
                  <div className="px-5 sm:px-7 space-y-3.5">
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {blog.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed whitespace-pre-line">
                      {blog.content}
                    </p>
                  </div>

                  {/* Hình ảnh chuyến đi */}
                  {Array.isArray(blog.images) && blog.images.length > 0 && blog.images[0] && (
                    <div className="px-5 sm:px-7 pt-4">
                      {blog.images.length === 1 ? (
                        <div className="relative aspect-video max-h-[45dvh] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
                          <img 
                            src={blog.images[0]} 
                            alt={blog.title}
                            className="absolute inset-0 w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={`grid gap-2 rounded-2xl overflow-hidden max-h-[45dvh] ${
                          blog.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                        }`}>
                          {blog.images.slice(0, 6).map((img, idx) => (
                            <div key={idx} className="relative aspect-video sm:aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden group/img">
                              <img
                                src={img}
                                alt={`${blog.title} - ảnh ${idx + 1}`}
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              {idx === 0 && (
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                                  Ảnh chính
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================= GẮN THẺ TOUR LIÊN QUAN (ĐIỂM NHẤN QUAN TRỌNG) ================= */}
                  {blog.tour && (
                    <div className="px-5 sm:px-7 pt-4">
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 dark:from-slate-800/90 dark:to-slate-800/70 border border-amber-200/90 dark:border-amber-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {blog.tour.featured_image && (
                            <img 
                              src={blog.tour.featured_image} 
                              alt={blog.tour.title}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-amber-200 dark:border-slate-700"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700 dark:text-amber-400 block">
                              📍 Tour du lịch được nhắc tới trong bài
                            </span>
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {blog.tour.title}
                            </h5>
                            <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                              {formatVND(blog.tour.base_price)}
                              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-1">/ khách ({blog.tour.duration_days} ngày)</span>
                            </span>
                          </div>
                        </div>

                        {/* Nút bấm dẫn tới trang Đặt Tour */}
                        <Link
                          to={`/tours/${blog.tour.id}`}
                          className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 group"
                        >
                          <span>Xem & Đặt chuyến này</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Thanh nút Thả tim, Bình luận, Chia sẻ */}
                  <div className="p-5 sm:p-7 pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-4">
                      {/* Nút Like */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(blog.id)}
                        className={`flex items-center gap-1.5 py-1 px-3 rounded-full transition active:scale-90 cursor-pointer ${
                          isLiked 
                            ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' 
                            : 'hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{blog.likes || 0}</span>
                        <span className="hidden sm:inline font-normal text-slate-400">Yêu thích</span>
                      </button>

                      {/* Nút Comment */}
                      <button
                        type="button"
                        onClick={() => setActiveCommentBlogId(isCommentsOpen ? null : blog.id)}
                        className={`flex items-center gap-1.5 py-1 px-3 rounded-full transition cursor-pointer ${
                          isCommentsOpen 
                            ? 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' 
                            : 'hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{Array.isArray(blog.comments) ? blog.comments.length : 0}</span>
                        <span className="hidden sm:inline font-normal text-slate-400">Bình luận</span>
                      </button>
                    </div>

                    {/* Nút Chia sẻ */}
                    <button
                      type="button"
                      onClick={() => handleSharePost(blog)}
                      className="flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Chia sẻ</span>
                    </button>
                  </div>

                  {/* ================= KHU VỰC BÌNH LUẬN (COMMENTS EXPANDED) ================= */}
                  {isCommentsOpen && (
                    <div className="bg-slate-50/70 dark:bg-slate-950/50 p-5 sm:p-7 border-t border-slate-200/80 dark:border-slate-800 space-y-4 animate-fadeIn">
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-sky-500" />
                        <span>Bình luận ({Array.isArray(blog.comments) ? blog.comments.length : 0})</span>
                      </h5>

                      {/* Danh sách các bình luận hiện có */}
                      {Array.isArray(blog.comments) && blog.comments.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {blog.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-2.5 text-xs bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                              {comment.userAvatar ? (
                                <img src={comment.userAvatar} alt={comment.userName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                  {comment.userName ? comment.userName.charAt(0) : 'U'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-extrabold text-slate-900 dark:text-white truncate">
                                    {comment.userName}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mt-1 font-light leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                          Chưa có bình luận nào. Hãy là người đầu tiên để lại lời nhắn!
                        </p>
                      )}

                      {/* Ô nhập bình luận */}
                      <form onSubmit={(e) => handleAddComment(blog.id, e)} className="space-y-2 pt-2">
                        {!currentUser && (
                          <input
                            type="text"
                            placeholder="Tên của bạn..."
                            value={guestNameInput}
                            onChange={(e) => setGuestNameInput(e.target.value)}
                            className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-sky-500"
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Viết cảm nghĩ hoặc hỏi thăm về chuyến đi..."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="flex-1 px-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-sky-500"
                          />
                          <button
                            type="submit"
                            disabled={submittingCommentBlogId === blog.id}
                            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Gửi</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* ================= SENTINEL CHO INFINITE SCROLL & TRẠNG THÁI CUỐI TRANG ================= */}
        <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center min-h-[60px]">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tải thêm những bài viết tiếp theo...</span>
            </div>
          )}

          {!hasMore && blogs.length > 0 && !isInitialLoading && (
            <div className="w-full text-center py-6 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
              <span className="text-2xl">🎉</span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Bạn đã xem hết tất cả bài viết hôm nay!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Cảm ơn bạn đã đồng hành cùng các lữ khách. Hãy bấm nút viết bài bên trên để chia sẻ câu chuyện của riêng bạn nhé!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ================= MODAL VIẾT BÀI MỚI (CREATE BLOG MODAL) ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    Chia Sẻ Kỷ Niệm & Trải Nghiệm Du Lịch
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bài viết của bạn sẽ được lưu giữ và truyền cảm hứng cho hàng ngàn lữ khách khác
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateBlogSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Tiêu đề bài viết */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chuyến đi săn mây Cầu Đất tuyệt đẹp cùng hội bạn thân..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Địa điểm & Cảm xúc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Địa điểm trải nghiệm
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Ví dụ: Sa Pa, Đà Lạt, Phú Quốc..."
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cảm xúc chủ đạo (Mood)
                  </label>
                  <div className="relative flex items-center">
                    <Smile className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <select
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    >
                      {BLOG_MOODS.filter((m) => m.id !== 'all').map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.emoji} {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Gắn thẻ Tour liên quan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gắn thẻ Tour liên quan (Để bạn đọc có thể bấm đặt chuyến trực tiếp)
                </label>
                <select
                  value={newTourId}
                  onChange={(e) => setNewTourId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Không gắn thẻ tour nào --</option>
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.destination_name} - {formatVND(t.base_price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hình ảnh chuyến đi */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hình ảnh chuyến đi{' '}
                    <span className="text-amber-500 font-normal">
                      ({uploadedImages.length}/6 ảnh)
                    </span>
                  </label>
                  {uploadedImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUploadedImages([])}
                      className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer transition"
                    >
                      Xóa tất cả ảnh
                    </button>
                  )}
                </div>

                {/* Tab chuyển đổi nguồn ảnh: Từ thiết bị vs Link URL / Kho ảnh */}
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      imageTab === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Từ Thiết Bị (Máy tính/Điện thoại)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      imageTab === 'url'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link URL / Kho Có Sẵn</span>
                  </button>
                </div>

                {/* TAB 1: TẢI TỪ THIẾT BỊ */}
                {imageTab === 'upload' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-amber-300 dark:border-amber-700/60 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-5 text-center cursor-pointer bg-amber-50/40 dark:bg-slate-800/40 hover:bg-amber-50/80 transition group"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Bấm vào đây để chọn ảnh kỷ niệm từ máy tính hoặc điện thoại
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Hỗ trợ định dạng JPG, PNG, WEBP (Tự động nén & tối ưu dung lượng)
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: LINK NGOÀI & KHO ẢNH */}
                {imageTab === 'url' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          placeholder="Dán đường link ảnh: https://..."
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUrlImage();
                            }
                          }}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddUrlImage}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 transition cursor-pointer"
                      >
                        Thêm Link
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-400">Chọn nhanh ảnh mẫu:</span>
                      {QUICK_IMAGE_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleSelectPreset(p.url)}
                          className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        >
                          +{p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DANH SÁCH PREVIEW CÁC ẢNH ĐÃ CHỌN */}
                {uploadedImages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Ảnh đã nạp cho bài viết ({uploadedImages.length} ảnh):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {uploadedImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-stone-950 shadow-xs">
                              Ảnh bìa
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition cursor-pointer opacity-90 group-hover:opacity-100"
                            title="Xóa ảnh này"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {uploadedImages.length < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageTab('upload');
                            fileInputRef.current?.click();
                          }}
                          className="aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/40"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-bold mt-0.5">+ Thêm ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Nội dung câu chuyện */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung trải nghiệm & kỷ niệm vui buồn <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Kể về chuyến đi của bạn: điều gì làm bạn xúc động nhất? Khó khăn gì trên đường? Món ăn nào làm bạn nhớ mãi? Cảm xúc lúc đó thế nào?..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                ></textarea>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? 'Đang đăng tải...' : 'Đăng Bài Viết Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
