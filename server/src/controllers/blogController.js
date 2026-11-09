const { blogs, tours, saveBlogs } = require('../config/data');

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

    let filtered = [...blogs];

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
      createdAt: new Date().toISOString()
    };

    // Đưa bài viết mới nhất lên đầu danh sách
    blogs.unshift(newBlog);
    saveBlogs();

    res.status(201).json({
      success: true,
      message: 'Đăng tải bài viết trải nghiệm thành công!',
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
  deleteBlog
};
