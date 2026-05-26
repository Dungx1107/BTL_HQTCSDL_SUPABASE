-- Chèn một số sản phẩm "mồi" để demo tính năng Stemming (Chuẩn hóa từ gốc tiếng Anh)
INSERT INTO public.products (name, description, price, stock) VALUES
('Premium Gaming Device', 'This hardware is perfect for professional gamers who love gaming all night.', 1200.00, 50),
('Budget Laptop Air', 'A slim laptop designed for students. Ideal for light office work and web browsing.', 600.00, 120);

-- Chèn các sản phẩm để demo tính năng Ranking (Xếp hạng độ liên quan)
-- Sản phẩm 1: Từ khóa xuất hiện ở cả Tên và Mô tả (Điểm số Rank sẽ rất cao)
INSERT INTO public.products (name, description, price, stock) VALUES
('Ultra Gaming Laptop X', 'The ultimate gaming laptop equipped with next-gen GPU for core gaming performance.', 2400.00, 15);

-- Sản phẩm 2: Từ khóa chỉ xuất hiện ở Mô tả, Tên không có (Điểm số Rank thấp hơn)
INSERT INTO public.products (name, description, price, stock) VALUES
('Pro Workstation Tower', 'An enterprise desktop computer that can double as a powerful gaming laptop configuration if upgraded.', 1800.00, 8);