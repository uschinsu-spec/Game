import re
import json

txt_path = r'H:\GOOGLE DRIVER\Danh_sach_CHI_TIET_Nhan_Gioi_HoangDa_BiCanh_DaTang.txt'

regions = {}
provinces = []

current_continent = None
current_region = None
current_province = None
current_nation = None
current_city = None

with open(txt_path, 'r', encoding='utf-8') as f:
    for line in f:
        line_s = line.strip()
        if not line_s:
            continue
        
        m_cont = re.match(r'^#\s+ĐẠI LỤC:\s*(.+)$', line_s)
        if m_cont:
            current_continent = m_cont.group(1).strip()
            continue
        
        m_reg = re.match(r'^##\s+VÙNG:\s*(.+)$', line_s)
        if m_reg:
            current_region = {
                'name': m_reg.group(1).strip(),
                'continent': current_continent,
                'wilds': [],
                'secretRealms': []
            }
            regions[current_region['name']] = current_region
            continue
        
        m_vw = re.match(r'^\[VÙNG-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_vw and current_region:
            current_region['wilds'].append(m_vw.group(1).strip())
            continue
        
        m_vs = re.match(r'^\[VÙNG-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_vs and current_region:
            current_region['secretRealms'].append(m_vs.group(1).strip())
            continue
        
        m_prov = re.match(r'^###\s*\[(\d+)\]\s*(.+?)\s*\((.+?)\)$', line_s)
        if m_prov:
            current_province = {
                'index': int(m_prov.group(1)),
                'name': m_prov.group(2).strip(),
                'typeLabel': m_prov.group(3).strip(),
                'continent': current_continent,
                'region': current_region['name'] if current_region else '',
                'wilds': [],
                'secretRealms': [],
                'nations': []
            }
            provinces.append(current_province)
            current_nation = None
            current_city = None
            continue
        
        m_cw = re.match(r'^\[CHÂU-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_cw and current_province:
            current_province['wilds'].append(m_cw.group(1).strip())
            continue
        
        m_cs = re.match(r'^\[CHÂU-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_cs and current_province:
            current_province['secretRealms'].append(m_cs.group(1).strip())
            continue
        
        m_nat = re.match(r'^\d+\.\s*QUỐC GIA:\s*(.+)$', line_s)
        if m_nat and current_province:
            current_nation = {
                'name': m_nat.group(1).strip(),
                'wilds': [],
                'secretRealms': [],
                'cities': []
            }
            current_province['nations'].append(current_nation)
            current_city = None
            continue
        
        m_qw = re.match(r'^\[QUỐC-GIA-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_qw and current_nation:
            current_nation['wilds'].append(m_qw.group(1).strip())
            continue
        
        m_qs = re.match(r'^\[QUỐC-GIA-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_qs and current_nation:
            current_nation['secretRealms'].append(m_qs.group(1).strip())
            continue
        
        m_city = re.match(r'^\d+\.\d+\.\s*THÀNH:\s*(.+)$', line_s)
        if m_city and current_nation:
            current_city = {
                'name': m_city.group(1).strip(),
                'villages': [],
                'wilds': [],
                'secretRealms': []
            }
            current_nation['cities'].append(current_city)
            continue
        
        m_vil = re.match(r'^\[THÔN\s*\d+\]\s*(.+)$', line_s)
        if m_vil and current_city:
            current_city['villages'].append(m_vil.group(1).strip())
            continue
        
        m_thw = re.match(r'^\[THÀNH-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_thw and current_city:
            current_city['wilds'].append(m_thw.group(1).strip())
            continue
        
        m_ths = re.match(r'^\[THÀNH-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_ths and current_city:
            current_city['secretRealms'].append(m_ths.group(1).strip())
            continue

atlas_output_path = r'src\config\world\humanRealmExpandedAtlas.js'
with open(atlas_output_path, 'w', encoding='utf-8') as f:
    f.write('/**\n')
    f.write(' * humanRealmExpandedAtlas.js\n')
    f.write(' * Chi tiết Hoang Dã & Bí Cảnh đa tầng (Vùng, Châu, Quốc Gia, Thành) toàn cõi Nhân Giới\n')
    f.write(' */\n\n')
    
    f.write('export const EXPANDED_HUMAN_REALM_REGIONS = ')
    f.write(json.dumps(list(regions.values()), ensure_ascii=False, indent=2))
    f.write(';\n\n')
    
    f.write('export const EXPANDED_HUMAN_REALM_ATLAS = ')
    f.write(json.dumps(provinces, ensure_ascii=False, indent=2))
    f.write(';\n')

print(f"Generated {atlas_output_path} successfully!")
