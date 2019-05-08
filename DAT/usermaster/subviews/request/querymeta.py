import requests

def get_fake_api(meta, api_ref):

    files = {'image': open(meta.get_full_origin(), 'rb')}
    try:
        r = requests.post(api_ref.local_api_url, files=files, verify=False)
    except:
        try:
            if api_ref.public_api_url != "https://api_name_public/":
                r = requests.post(api_ref, files=files, verify=False)
        except Exception as e:
            r = None
            data = [{'error': str(e)}]
    if r:
        try:
            json_data = r.json()
            #print(json_data)
            data = [
                {
                    'tag_label': lb['label'],
                    'type_label': 'rect',
                    'color': api_ref.get_color_label(lb['label'], 'rect'),
                    'flag': 1,
                    'accept_report_flag': False,
                    'position': ','.join([str(lb['xmin']), str(lb['ymin']), str(lb['xmax']), str(lb['ymax'])]),
                    'conf': round(lb['conf'], 2),
                    'accept_edit': lb['conf'] < api_ref.percent_accept/100.0,
                } for lb in json_data['data']['boxes']
            ]
            
        except Exception as e:
            print(e)
            data = [{'error': json_data}]
        #{'data':{'boxes':[{'conf', 'label', 'xmax', 'ymax', 'xmin', 'ymin'}], '...parameters'}
    return data


def query_meta(meta, api_reference):

    data = {
        'name': meta.get_abs_origin(),
        'url_meta': meta.get_url_meta(),
        'boxes_position': [
            {
                'tag_label': bb.label.tag_label,
                'type_label': bb.label.type_label,
                'color': bb.label.color,
                'flag': bb.flag,
                'accept_report_flag': bb.accept_report_flag,
                'position': bb.position,
            } for bb in meta.boxes_position.all()
        ]
    }

    if not meta.is_reference_api:
        data['predict'] = sum([
            get_fake_api(meta, api_ref) for api_ref in api_reference.all()
        ], [])
        
    return data
