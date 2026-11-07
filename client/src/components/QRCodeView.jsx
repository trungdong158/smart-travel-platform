import { useMemo, useState } from 'react';
import { generateQRMatrix } from '../utils/qrCode';

export default function QRCodeView({
  value,
  size = 160,
  level = 'M',
  className = '',
  imageFallbackUrl = null,
  alt = 'QR Code'
}) {
  const [imgError, setImgError] = useState(false);

  // Sinh ma trận QR Code thuần vector SVG dự phòng offline
  const qrData = useMemo(() => {
    if (!value) return null;
    try {
      return generateQRMatrix(value, level);
    } catch {
      return null;
    }
  }, [value, level]);

  // URL ảnh online chuẩn hóa từ api.qrserver.com hoặc link bên ngoài (VietQR/MoMo)
  const effectiveImageUrl = imageFallbackUrl || (
    value 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=4&data=${encodeURIComponent(value)}`
      : null
  );

  // Nếu có link ảnh và chưa bị lỗi mạng, ưu tiên hiển thị ảnh chuẩn
  if (effectiveImageUrl && !imgError) {
    return (
      <div 
        className={`inline-flex items-center justify-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-700/80 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={effectiveImageUrl}
          alt={alt}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  if (!qrData || !qrData.matrix) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs text-center p-2 rounded-xl ${className}`}
        style={{ width: size, height: size }}
      >
        Mã QR không khả dụng
      </div>
    );
  }

  const { count, matrix } = qrData;
  const margin = 4; // Quiet Zone 4 modules theo chuẩn ISO/IEC 18004
  const totalSize = count + margin * 2;

  return (
    <div 
      className={`inline-flex items-center justify-center bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-700/80 ${className}`}
      style={{ width: size, height: size }}
      title={value}
    >
      <svg
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        <rect width={totalSize} height={totalSize} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((isDark, c) =>
            isDark ? (
              <rect
                key={`${r}-${c}`}
                x={c + margin}
                y={r + margin}
                width={1}
                height={1}
                fill="#000000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
