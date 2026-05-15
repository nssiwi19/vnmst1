-- SQL Script to optimize VN-MST Stats
-- Run this in your Supabase SQL Editor

-- 1. Thống kê theo Tỉnh/Thành
CREATE OR REPLACE FUNCTION get_stats_by_region(p_year int DEFAULT NULL, p_industry text DEFAULT NULL)
RETURNS TABLE (name text, value bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN ma_phuong LIKE 'HC%' THEN 'Hồ Chí Minh'
            WHEN ma_phuong LIKE 'HN%' THEN 'Hà Nội'
            ELSE 'Khác'
        END as name,
        COUNT(ma_so_thue) as value
    FROM company
    WHERE 
        (p_year IS NULL OR ngay_thanh_lap LIKE '%' || p_year || '%')
        AND (p_industry IS NULL OR ma_nganh = p_industry)
    GROUP BY name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Thống kê theo Ngành nghề (Top 50)
CREATE OR REPLACE FUNCTION get_stats_by_industry()
RETURNS TABLE (name text, value bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.ma_nganh || ' - ' || COALESCE(n.ten_nganh, 'N/A') as name,
        COUNT(c.ma_so_thue) as value
    FROM company c
    LEFT JOIN nganh_nghe n ON c.ma_nganh = n.ma_nganh
    GROUP BY c.ma_nganh, n.ten_nganh
    ORDER BY value DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Thống kê xu hướng tăng trưởng (2024-2026)
CREATE OR REPLACE FUNCTION get_growth_trend(p_industry text DEFAULT NULL)
RETURNS TABLE (name text, value bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        y.year::text as name,
        COUNT(c.id) as value
    FROM (SELECT generate_series(2024, 2026) as year) y
    LEFT JOIN company c ON (
        (c.ngay_thanh_lap LIKE '%' || y.year || '%' OR c.ngay_thanh_lap LIKE y.year || '-%')
        AND (p_industry IS NULL OR c.ma_nganh = p_industry)
    )
    GROUP BY y.year
    ORDER BY y.year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Phân bố theo tháng
CREATE OR REPLACE FUNCTION get_monthly_distribution(p_year int DEFAULT NULL, p_industry text DEFAULT NULL)
RETURNS TABLE (month text, value bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.month_num as month,
        COUNT(c.id) as value
    FROM (
        SELECT lpad(generate_series(1, 12)::text, 2, '0') as month_num
    ) m
    LEFT JOIN company c ON (
        (
            (c.ngay_thanh_lap LIKE '%/' || m.month_num || '/%') OR 
            (c.ngay_thanh_lap LIKE '%-' || m.month_num || '-%')
        )
        AND (p_year IS NULL OR c.ngay_thanh_lap LIKE '%' || p_year || '%')
        AND (p_industry IS NULL OR c.ma_nganh = p_industry)
    )
    GROUP BY m.month_num
    ORDER BY m.month_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Đánh giá chất lượng dữ liệu
CREATE OR REPLACE FUNCTION get_data_quality(p_year int DEFAULT NULL, p_industry text DEFAULT NULL)
RETURNS TABLE (name text, value numeric, count bigint, total bigint) AS $$
DECLARE
    v_total bigint;
BEGIN
    SELECT COUNT(*) INTO v_total FROM company 
    WHERE (p_year IS NULL OR ngay_thanh_lap LIKE '%' || p_year || '%')
      AND (p_industry IS NULL OR ma_nganh = p_industry);

    IF v_total = 0 THEN RETURN; END IF;

    RETURN QUERY
    SELECT 'Số điện thoại'::text, ROUND(COUNT(so_dien_thoai)::numeric / v_total * 100, 1), COUNT(so_dien_thoai), v_total FROM company WHERE (p_year IS NULL OR ngay_thanh_lap LIKE '%' || p_year || '%') AND (p_industry IS NULL OR ma_nganh = p_industry) AND so_dien_thoai IS NOT NULL AND so_dien_thoai <> ''
    UNION ALL
    SELECT 'Email'::text, ROUND(COUNT(email)::numeric / v_total * 100, 1), COUNT(email), v_total FROM company WHERE (p_year IS NULL OR ngay_thanh_lap LIKE '%' || p_year || '%') AND (p_industry IS NULL OR ma_nganh = p_industry) AND email IS NOT NULL AND email <> ''
    UNION ALL
    SELECT 'Địa chỉ đầy đủ'::text, ROUND(COUNT(dia_chi_day_du)::numeric / v_total * 100, 1), COUNT(dia_chi_day_du), v_total FROM company WHERE (p_year IS NULL OR ngay_thanh_lap LIKE '%' || p_year || '%') AND (p_industry IS NULL OR ma_nganh = p_industry) AND dia_chi_day_du IS NOT NULL AND dia_chi_day_du <> ''
    UNION ALL
    SELECT 'Mã ngành'::text, ROUND(COUNT(ma_nganh)::numeric / v_total * 100, 1), COUNT(ma_nganh), v_total FROM company WHERE (p_year IS NULL OR ngay_thanh_lap LIKE '%' || p_year || '%') AND (p_industry IS NULL OR ma_nganh = p_industry) AND ma_nganh IS NOT NULL AND ma_nganh <> ''
    UNION ALL
    SELECT 'Ngày thành lập'::text, ROUND(COUNT(ngay_thanh_lap)::numeric / v_total * 100, 1), COUNT(ngay_thanh_lap), v_total FROM company WHERE (p_year IS NULL OR ngay_thanh_lap LIKE '%' || p_year || '%') AND (p_industry IS NULL OR ma_nganh = p_industry) AND ngay_thanh_lap IS NOT NULL AND ngay_thanh_lap <> '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Kích hoạt Realtime cho bảng company_analysis
ALTER PUBLICATION supabase_realtime ADD TABLE company_analysis;
