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
        
        # # ĐẠI LỤC: Nam Lăng Đại Lục
        m_cont = re.match(r'^#\s+ĐẠI LỤC:\s*(.+)$', line_s)
        if m_cont:
            current_continent = m_cont.group(1).strip()
            continue
        
        # ## VÙNG: Thanh Linh Vực
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
        
        # [VÙNG-HOANG-DÃ 1] ...
        m_vw = re.match(r'^\[VÙNG-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_vw and current_region:
            current_region['wilds'].append(m_vw.group(1).strip())
            continue
        
        # [VÙNG-BÍ-CẢNH 1] ...
        m_vs = re.match(r'^\[VÙNG-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_vs and current_region:
            current_region['secretRealms'].append(m_vs.group(1).strip())
            continue
        
        # ### [001] Thanh Châu (CHÂU)
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
        
        # [CHÂU-HOANG-DÃ 1] ...
        m_cw = re.match(r'^\[CHÂU-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_cw and current_province:
            current_province['wilds'].append(m_cw.group(1).strip())
            continue
        
        # [CHÂU-BÍ-CẢNH 1] ...
        m_cs = re.match(r'^\[CHÂU-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_cs and current_province:
            current_province['secretRealms'].append(m_cs.group(1).strip())
            continue
        
        # 1. QUỐC GIA: Đại Ly Quốc
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
        
        # [QUỐC-GIA-HOANG-DÃ 1] ...
        m_qw = re.match(r'^\[QUỐC-GIA-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_qw and current_nation:
            current_nation['wilds'].append(m_qw.group(1).strip())
            continue
        
        # [QUỐC-GIA-BÍ-CẢNH 1] ...
        m_qs = re.match(r'^\[QUỐC-GIA-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_qs and current_nation:
            current_nation['secretRealms'].append(m_qs.group(1).strip())
            continue
        
        # 1.1. THÀNH: Thanh Hà Hoàng Thành
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
        
        # [THÔN 1] ...
        m_vil = re.match(r'^\[THÔN\s*\d+\]\s*(.+)$', line_s)
        if m_vil and current_city:
            current_city['villages'].append(m_vil.group(1).strip())
            continue
        
        # [THÀNH-HOANG-DÃ 1] ...
        m_thw = re.match(r'^\[THÀNH-HOANG-DÃ\s*\d+\]\s*(.+)$', line_s)
        if m_thw and current_city:
            current_city['wilds'].append(m_thw.group(1).strip())
            continue
        
        # [THÀNH-BÍ-CẢNH 1] ...
        m_ths = re.match(r'^\[THÀNH-BÍ-CẢNH\s*\d+\]\s*(.+)$', line_s)
        if m_ths and current_city:
            current_city['secretRealms'].append(m_ths.group(1).strip())
            continue

print(f"Total regions: {len(regions)}")
print(f"Total provinces: {len(provinces)}")

# Count stats
total_nat = sum(len(p['nations']) for p in provinces)
total_city = sum(len(n['cities']) for p in provinces for n in p['nations'])
total_village = sum(len(c['villages']) for p in provinces for n in p['nations'] for c in n['cities'])
total_city_wilds = sum(len(c['wilds']) for p in provinces for n in p['nations'] for c in n['cities'])
total_city_secrets = sum(len(c['secretRealms']) for p in provinces for n in p['nations'] for c in n['cities'])
total_nat_wilds = sum(len(n['wilds']) for p in provinces for n in p['nations'])
total_nat_secrets = sum(len(n['secretRealms']) for p in provinces for n in p['nations'])
total_prov_wilds = sum(len(p['wilds']) for p in provinces)
total_prov_secrets = sum(len(p['secretRealms']) for p in provinces)
total_reg_wilds = sum(len(r['wilds']) for r in regions.values())
total_reg_secrets = sum(len(r['secretRealms']) for r in regions.values())

print(f"Total nations: {total_nat}")
print(f"Total cities: {total_city}")
print(f"Total villages: {total_village}")
print(f"Total city wilds: {total_city_wilds}")
print(f"Total city secret realms: {total_city_secrets}")
print(f"Total nation wilds: {total_nat_wilds}")
print(f"Total nation secret realms: {total_nat_secrets}")
print(f"Total province wilds: {total_prov_wilds}")
print(f"Total province secret realms: {total_prov_secrets}")
print(f"Total region wilds: {total_reg_wilds}")
print(f"Total region secret realms: {total_reg_secrets}")
