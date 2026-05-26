INSERT INTO public.products (name, description, price, stock) VALUES
-- Dòng 1 & 2 để test tính năng Stemming (Chuẩn hóa từ gốc)
('Premium Gaming Device', 'This hardware is perfect for professional gamers who love gaming all night.', 1200.00, 50),
('Budget Laptop Air', 'A slim laptop designed for students. Ideal for light office work and web browsing.', 600.00, 120),

-- Dòng 3 & 4 để test tính năng Ranking (Xếp hạng: Từ khóa ở tên điểm cao hơn ở mô tả)
('Ultra Gaming Laptop X', 'The ultimate hardware equipped with next-gen GPU for core performance.', 2400.00, 15),
('Pro Workstation Tower', 'An enterprise desktop computer that can double as a powerful gaming laptop configuration.', 1800.00, 8);