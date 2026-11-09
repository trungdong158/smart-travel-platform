const {
  blogs,
  tours,
  saveBlogs,
  getBlogApprovalRequired,
  setBlogApprovalRequired
} = require('../config/data');

const normalizeBlogStatus = (blog) => {
  if (!blog || !blog.status) return 'APPROVED';
  return ['PENDING', 'APPROVED', 'REJECTED'].includes(blog.status) ? blog.status : 'APPROVED';
};

const shouldBlogBeVisible = (blog, currentUser = null) => {
  const status = normalizeBlogStatus(blog);
  if (status === 'REJECTED') return false;

  // Bài viết của ADMIN luôn luôn được hiển thị công khai ngay
  if (blog.author && blog.author.role === 'ADMIN') {
    return true;
  }

  // Tác giả bài viết luôn có thể nhìn thấy bài viết của mình
  if (currentUser && blog.author && (String(blog.author.id) === String(currentUser.id) || blog.author.email === currentUser.email)) {
    return true;
  }

  // Quản trị viên (ADMIN) khi duyệt trang blog có thể xem được tất cả bài
  if (currentUser && currentUser.role === 'ADMIN') {
    return true;
  }

  // Nếu chế độ duyệt bài đang BẬT: chỉ hiển thị bài đã APPROVED
  if (getBlogApprovalRequired()) {
    return status === 'APPROVED';
  }

  // Nếu chế độ duyệt bài đang TẮT: tất cả bài viết không bị REJECTED đều hiển thị
  return true;
};

/**
 * Lấy danh sách bài viết blog du lịch (Hỗ trợ phân trang Infinite Scroll 2 bài/lần)
 */
const getAllBlogs = (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 2);
    const mood = req.query.mood;
    const tourId = req.query.tourId;
    const search = req.query.search;

    let filtered = [...blogs].filter(blog => shouldBlogBeVisible(blog, req.user));

    // Lọc theo tâm trạng (Mood)
    if (mood && mood !== 'all') {
      filtered = filtered.filter(b => b.mood === mood);
    }

    // Lọc theo Tour liên quan
    if (tourId) {
      filtered = filtered.filter(b => String(b.tourId) === String(tourId));
    }

    // Tìm kiếm theo tiêu đề, nội dung, địa điểm
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(b => 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.location && b.location.toLowerCase().includes(q)) ||
        (b.content && b.content.toLowerCase().includes(q))
      );
    }

    // Sắp xếp bài viết mới nhất lên trước
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pagedItems = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    res.json({
      success: true,
      data: pagedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách blog:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách bài viết!'
    });
  }
};

/**
 * Lấy chi tiết 1 bài viết theo ID
 */
const getBlogById = (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const blog = blogs.find(b => b.id === blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết này!'
      });
    }

    const isAdmin = req.user && req.user.role === 'ADMIN';
    if (!isAdmin && !shouldBlogBeVisible(blog, req.user)) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết này đang chờ duyệt hoặc đã bị từ chối!'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy chi tiết bài viết!'
    });
  }
};

/**
 * Đăng bài viết blog mới (Yêu cầu đăng nhập)
 */
const createBlog = (req, res) => {
  try {
    const { title, content, location, mood, moodLabel, tourId, images } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung bài viết không được để trống!'
      });
    }

    // Tìm thông tin tour liên quan nếu người dùng có gắn thẻ
    let tourMeta = null;
    if (tourId) {
      const matchedTour = tours.find(t => String(t.id) === String(tourId));
      if (matchedTour) {
        tourMeta = {
          id: matchedTour.id,
          title: matchedTour.title,
          base_price: matchedTour.base_price,
          duration_days: matchedTour.duration_days,
          destination_name: matchedTour.destination_name,
          featured_image: matchedTour.featured_image,
          rating: matchedTour.rating
        };
      }
    }

    const defaultCover = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
    const processedImages = Array.isArray(images) && images.length > 0 
      ? images.filter(img => img && typeof img === 'string') 
      : [defaultCover];

    const isAdmin = req.user && req.user.role === 'ADMIN';
    const isApprovalRequired = getBlogApprovalRequired();

    // Nguyên tắc duyệt bài viết:
    // 1. Tính năng duyệt bài viết chỉ áp dụng cho bài viết của user, KHÔNG áp dụng với bài viết của admin (Admin luôn APPROVED ngay).
    // 2. Tính năng duyệt bài viết chỉ hoạt động khi BẬT nút duyệt bài viết trong trang quản trị (isApprovalRequired === true).
    let initialStatus = 'APPROVED';
    if (!isAdmin && isApprovalRequired) {
      initialStatus = 'PENDING';
    }

    const newBlog = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      location: (location || 'Việt Nam').trim(),
      mood: mood || 'healing',
      moodLabel: moodLabel || 'Chữa Lành & Tĩnh Tại',
      author: {
        id: req.user.id,
        name: req.user.fullName || req.user.name || 'Du Khách SoulTrip',
        email: req.user.email,
        avatar: req.user.avatar || '',
        role: req.user.role || 'CUSTOMER'
      },
      images: processedImages,
      tourId: tourId ? parseInt(tourId) : null,
      tour: tourMeta,
      likes: 0,
      likedUserIds: [],
      comments: [],
      status: initialStatus,
      createdAt: new Date().toISOString()
    };

    // Đưa bài viết mới nhất lên đầu danh sách
    blogs.unshift(newBlog);
    saveBlogs();

    res.status(201).json({
      success: true,
      message: initialStatus === 'PENDING'
        ? 'Bài viết của bạn đã được gửi và đang chờ quản trị viên phê duyệt!'
        : 'Đăng tải bài viết trải nghiệm thành công!',
      data: newBlog
    });
  } catch (error) {
    console.error('Lỗi khi đăng bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể đăng bài viết lúc này!'
    });
  }
};

/**
 * Thêm bình luận vào bài viết
 */
const addComment = (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống!'
      });
    }

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại!'
      });
    }

    if (!Array.isArray(blog.comments)) {
      blog.comments = [];
    }

    const newComment = {
      id: Date.now(),
      userId: req.user ? req.user.id : (Date.now() % 100000),
      userName: req.user ? (req.user.fullName || req.user.name) : (req.body.userName || 'Du khách'),
      userAvatar: req.user ? (req.user.avatar || '') : '',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    blog.comments.push(newComment);
    saveBlogs();

    res.status(201).json({
      success: true,
      message: 'Đã gửi bình luận thành công!',
      data: newComment,
      comments: blog.comments
    });
  } catch (error) {
    console.error('Lỗi khi thêm bình luận:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi gửi bình luận!'
    });
  }
};

/**
 * Thả tim / Bỏ thả tim bài viết
 */
const toggleLike = (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const userId = req.user ? req.user.id : (req.body.userId || 'guest_user');

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Bài viết không tồn tại!'
      });
    }

    if (!Array.isArray(blog.likedUserIds)) {
      blog.likedUserIds = [];
    }

    const index = blog.likedUserIds.findIndex(uid => String(uid) === String(userId));
    let isLiked = false;

    if (index > -1) {
      // Đã like -> bỏ like
      blog.likedUserIds.splice(index, 1);
      blog.likes = Math.max(0, (blog.likes || 1) - 1);
      isLiked = false;
    } else {
      // Chưa like -> like
      blog.likedUserIds.push(userId);
      blog.likes = (blog.likes || 0) + 1;
      isLiked = true;
    }

    saveBlogs();

    res.json({
      success: true,
      likes: blog.likes,
      isLiked
    });
  } catch (error) {
    console.error('Lỗi khi thả tim:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thực hiện thao tác thả tim!'
    });
  }
};

/**
 * Lấy danh sách bài viết của người dùng hiện tại (Dành cho trang cá nhân)
 */
const getMyBlogs = (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserEmail = req.user.email ? req.user.email.toLowerCase() : '';

    const myBlogs = blogs.filter(b => 
      (b.author && (String(b.author.id) === String(currentUserId) || (b.author.email && b.author.email.toLowerCase() === currentUserEmail)))
    );

    // Sắp xếp bài mới nhất lên đầu
    myBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: myBlogs
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết của tôi:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải bài viết cá nhân!'
    });
  }
};

/**
 * Lấy danh sách bài blog đang chờ duyệt (Admin)
 */
const getPendingBlogs = (req, res) => {
  try {
    const pendingBlogs = [...blogs]
      .filter(blog => normalizeBlogStatus(blog) === 'PENDING')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      count: pendingBlogs.length,
      data: pendingBlogs
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài viết chờ duyệt:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách bài viết chờ duyệt!'
    });
  }
};

const getBlogApprovalSetting = (req, res) => {
  try {
    return res.json({
      success: true,
      data: getBlogApprovalRequired()
    });
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt duyệt bài:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải cài đặt duyệt bài blog!'
    });
  }
};

const updateBlogApprovalSetting = (req, res) => {
  try {
    const { enabled } = req.body;
    const nextValue = typeof enabled === 'boolean' ? enabled : Boolean(enabled);
    const savedValue = setBlogApprovalRequired(nextValue);

    if (!savedValue) {
      blogs.forEach((blog) => {
        if (normalizeBlogStatus(blog) === 'PENDING') {
          blog.status = 'APPROVED';
        }
      });
      saveBlogs();
    }

    return res.json({
      success: true,
      message: savedValue
        ? 'Đã bật chế độ duyệt bài blog (Áp dụng với bài viết của user).'
        : 'Đã tắt chế độ duyệt bài blog (Bài viết của user sẽ tự động hiển thị ngay).',
      data: savedValue
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật cài đặt duyệt bài:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật cài đặt duyệt bài blog!'
    });
  }
};

/**
 * Duyệt / từ chối bài viết (Admin)
 */
const updateBlogStatus = (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái blog không hợp lệ!'
      });
    }

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết cần duyệt!'
      });
    }

    blog.status = status;
    saveBlogs();

    return res.json({
      success: true,
      message: status === 'APPROVED'
        ? 'Đã duyệt bài viết thành công!'
        : status === 'REJECTED'
        ? 'Đã từ chối bài viết!'
        : 'Đã chuyển bài viết về trạng thái chờ duyệt!',
      data: { id: blog.id, status: blog.status }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái blog:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái blog!'
    });
  }
};

/**
 * Xóa bài viết
 */
const deleteBlog = (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const index = blogs.findIndex(b => b.id === blogId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết cần xóa!'
      });
    }

    const blog = blogs[index];
    const isOwner = blog.author && (
      String(blog.author.id) === String(req.user.id) ||
      (blog.author.email && blog.author.email.toLowerCase() === (req.user.email || '').toLowerCase())
    );
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này!'
      });
    }

    blogs.splice(index, 1);
    saveBlogs();

    res.json({
      success: true,
      message: 'Đã xóa bài viết thành công!'
    });
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa bài viết!'
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  addComment,
  toggleLike,
  getMyBlogs,
  getPendingBlogs,
  getBlogApprovalSetting,
  updateBlogApprovalSetting,
  updateBlogStatus,
  deleteBlog
};
