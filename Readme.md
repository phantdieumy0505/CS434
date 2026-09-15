# 🌿 GreenLeaf Shop - Quản Lý Sản Phẩm Sống Xanh & Hữu Cơ

Hệ thống quản lý sản phẩm (Product CRUD) hoàn chỉnh được thiết kế theo chủ đề sinh thái, lối sống xanh và nông sản hữu cơ. Dự án bao gồm **Backend Express.js RESTful API** và **Frontend giao diện HTML5/CSS3/JavaScript hiện đại**.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
GreenLeaft-Shop/
├── GreenLeaft-BE/               # Backend Express REST API
│   ├── src/
│   │   ├── data/
│   │   │   └── products.json    # Dữ liệu sản phẩm lưu trữ bền vững (file JSON)
│   │   ├── routes/
│   │   │   └── products.js      # Router xử lý toàn bộ các API CRUD, thống kê, tìm kiếm
│   │   └── server.js            # Khởi tạo Express server, cấu hình CORS, Port 5001
│   └── package.json             # Cấu hình phụ thuộc Express, Cors, Dotenv
│
├── GreenLeaft-FE/               # Frontend Giao Diện Người Dùng
│   ├── css/
│   │   └── styles.css           # Hệ thống Design System màu xanh ngọc bích, Glassmorphism
│   ├── js/
│   │   └── app.js               # Logic tương tác DOM, gọi API Fetch, tìm kiếm, lọc, Modal, Toast
│   ├── index.html               # Trang chủ Dashboard & Danh mục sản phẩm
│   └── package.json             # Script phục vụ static server tiện lợi
│
└── Readme.md                    # Tài liệu hướng dẫn sử dụng chi tiết
```

---

## ✨ Tính Năng Nổi Bật

### 1. Giao Diện Người Dùng (Frontend)
- **Thiết kế chuẩn thẩm mỹ cao cấp (Modern Botanical Aesthetic)**: Tông màu chủ đạo Emerald Green (`#059669`, `#10B981`) kết hợp nền kem mềm mại và hiệu ứng kính mờ (Glassmorphism).
- **Thẻ thống kê nhanh (KPI Dashboard)**: Theo dõi ngay lập tức:
  - Tổng số sản phẩm trong kho.
  - Số lượng sản phẩm còn hàng.
  - Số lượng sản phẩm đã hết hàng.
  - Tổng giá trị tài sản hàng hóa trong kho (VNĐ).
- **Tìm kiếm & Bộ lọc nâng cao**:
  - Tìm kiếm tức thì theo tên, thành phần, công dụng với cơ chế Debounce mượt mà.
  - Danh mục dạng Pills: Bấm chọn nhanh danh mục (Trà & Thảo Mộc, Cây Cảnh Trong Nhà, Mỹ Phẩm Hữu Cơ, Đồ Dùng Tự Nhiên,...).
  - Lọc theo trạng thái tồn kho (Còn hàng / Hết hàng).
  - Sắp xếp đa dạng: Mới nhất, Giá tăng dần, Giá giảm dần, Tên A-Z, Tồn kho nhiều nhất.
- **Chế độ hiển thị kép**: Chuyển đổi linh hoạt giữa dạng **Lưới thẻ (Grid View)** và dạng **Danh sách bảng (Table View)**.
- **CRUD trực quan & Tiện dụng**:
  - **Thêm & Chỉnh sửa (Modal Dialog)**: Hỗ trợ live preview hình ảnh khi nhập URL, kiểm tra tính hợp lệ dữ liệu.
  - **Hộp thoại xác nhận xóa**: Tránh bấm nhầm khi xóa sản phẩm.
  - **Hệ thống Toast Notification**: Thông báo kết quả thao tác (Thành công / Lỗi) ở góc màn hình.

### 2. Máy Chủ Xử Lý (Backend)
- Xây dựng trên **Node.js & Express.js** chuẩn ES Modules (`import/export`).
- Đã cấu hình sẵn **CORS**, hỗ trợ gọi API từ bất kỳ cổng nào (Live Server 5500, Port 3000,...).
- Dữ liệu lưu trực tiếp vào file `products.json`, dữ liệu không bị mất khi khởi động lại máy chủ.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu hệ thống:
- Đã cài đặt **Node.js** (Khuyến nghị phiên bản 18 trở lên) và **npm**.

---

### Bước 1: Khởi động Backend (Express API)

Mở cửa sổ Terminal và chạy các lệnh sau:

```bash
cd GreenLeaft-Shop/GreenLeaft-BE

# Cài đặt các gói phụ thuộc (Express, CORS, Dotenv)
npm install

# Khởi chạy server ở chế độ tự reload khi sửa code
npm run dev

# Hoặc khởi chạy thông thường:
npm start
```

Sau khi khởi chạy thành công, máy chủ sẽ lắng nghe tại:
- **Địa chỉ máy chủ**: `http://localhost:5001`
- **Kiểm tra trạng thái**: `http://localhost:5001/api/health`
- **Danh sách sản phẩm**: `http://localhost:5001/api/products`

---

### Bước 2: Mở Giao Diện Frontend

Bạn có thể chạy Frontend theo một trong hai cách dưới đây:

#### Cách A: Dùng script `npm start` có sẵn
Mở một cửa sổ Terminal mới:
```bash
cd GreenLeaft-Shop/GreenLeaft-FE
npm start
```
Trình duyệt sẽ mở tại `http://localhost:3000`.

#### Cách B: Mở trực tiếp bằng Live Server (VS Code / Antigravity)
- Nhấp chuột phải vào file [GreenLeaft-FE/index.html](file:///Users/trieuvo/Documents/LandingCode/GreenLeaft-Shop/GreenLeaft-FE/index.html) và chọn **Open with Live Server**.
- Hoặc mở đường dẫn Live Server: `http://localhost:5500/GreenLeaft-Shop/GreenLeaft-FE/`.

---

## 📚 Tài Liệu RESTful API

Tất cả các endpoint đều có tiền tố `/api/products`.

| Phương thức | Endpoint | Mô tả | Tham số / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra trạng thái máy chủ | Không |
| `GET` | `/api/products` | Lấy danh sách sản phẩm | Query: `q`, `category`, `stock`, `sort` |
| `GET` | `/api/products/stats` | Thống kê số lượng & giá trị kho | Không |
| `GET` | `/api/products/categories` | Lấy danh sách danh mục duy nhất | Không |
| `GET` | `/api/products/:id` | Lấy thông tin chi tiết 1 sản phẩm | Param: `id` |
| `POST` | `/api/products` | Thêm sản phẩm mới | JSON body (xem cấu trúc dưới) |
| `PUT` | `/api/products/:id` | Cập nhật thông tin sản phẩm | Param `id`, JSON body |
| `DELETE` | `/api/products/:id` | Xóa sản phẩm theo ID | Param `id` |

### Cấu trúc dữ liệu JSON mẫu:
```json
{
  "id": "prod-1",
  "name": "Bột Trà Xanh Matcha Uji Hữu Cơ",
  "category": "Trà & Thảo Mộc",
  "price": 285000,
  "stock": 42,
  "description": "Bột trà xanh nguyên chất thu hoạch thủ công từ đồi trà hữu cơ Uji Nhật Bản.",
  "imageUrl": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
  "rating": 4.9,
  "isFeatured": true,
  "createdAt": "2026-09-01T08:00:00.000Z"
}
```

---

## 🛠️ Tùy Chỉnh & Mở Rộng

- **Đổi cổng Backend**: Bạn có thể tạo file `.env` trong thư mục `GreenLeaft-BE/` với nội dung `PORT=5002`. Khi đó hãy nhớ cập nhật `API_BASE_URL` trong [GreenLeaft-FE/js/app.js](file:///Users/trieuvo/Documents/LandingCode/GreenLeaft-Shop/GreenLeaft-FE/js/app.js) tương ứng.
- **Thêm danh mục mới**: Bạn có thể thêm bất kỳ danh mục mới nào khi gửi yêu cầu `POST`, hệ thống sẽ tự động cập nhật danh mục vào thanh lọc Pills trên giao diện.
