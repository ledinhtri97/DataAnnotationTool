import requests
from adminmaster.datamanagement.submodels.metadata import MetaDataModel

#widget = Widget.objects.get(id=18)
#next_widget = Widget.objects.filter(id__gt=widget.id).order_by('id').first()
def get_fake_api(meta, api_ref):

    files = {'image': open(meta.get_full_origin(), 'rb')}
    data = []
    
    try:
        print("try 1:", api_ref.local_api_url)
        r = requests.post(api_ref.local_api_url, files=files,verify=False)
        print("go to link", api_ref.local_api_url)
    except Exception as e:
        r = None
        print(e)
        data = [{'error': 'Failed to connect'}]
        # try:
        #     if api_ref.public_api_url != "https://api_name_public/":
        #         print(api_ref.public_api_url)
        #         r = requests.post(api_ref.public_api_url,
        #                           files=files, verify=False)
        #     print("try 2:", r)
        # except Exception as e:
        #     r = None
        #     data = [{'error': str(e)}]
    if r:
        try:
            json_data = r.json()
            available_labels = api_ref.available_labels()

            for lb in json_data['data']['boxes']:
                if lb['label'] in available_labels:
                    data.append({
                        'tag_label': lb['label'],
                        'type_label': 'rect',
                        'color': api_ref.get_color_label(lb['label'], 'rect'),
                        'flag': 1,
                        'accept_report_flag': False,
                        'position': ','.join([str(lb['xmin']), str(lb['ymin']), str(lb['xmax']), str(lb['ymax'])]),
                        'conf': round(lb['conf'], 2),
                        'accept_edit': lb['conf'] < api_ref.percent_accept/100.0,
                    })
 
            for i in range(len(data)):
                if data[i]['tag_label'] == 'license_plate':
                    lpo = data[i]['position'].split(',')
                    data[i]['type_label'] = 'poly'
                    data[i]['position'] = ','.join(
                        [lpo[0], lpo[1], lpo[2], lpo[1], lpo[2], lpo[3], lpo[0], lpo[3]])

        except Exception as e:
            print(e)
            data = [{'error': 'Failed to connect', 'catch': str(e)}]
        #{'data':{'boxes':[{'conf', 'label', 'xmax', 'ymax', 'xmin', 'ymin'}], '...parameters'}
    #print(data)
    return data


fake = [
    {
        'tag_label': 'smoke',
        'type_label': 'rect',
        'color': '#F0F0F0',
        'flag': 1,
        'accept_report_flag': False,
        'position': '0.65,0.25,0.95,0.53',
        'conf': 0.45,
        'accept_edit': True,
    },
    {
        'tag_label': 'fire',
        'type_label': 'rect',
        'color': '#4285F4',
        'flag': 1,
        'accept_report_flag': False,
        'position': '0.54,0.35,0.85,0.95',
        'conf': 0.95,
        'accept_edit': False,
    }
]


def query_meta_reference(meta, api_reference):
    data = {}
    
    if len(api_reference.all()) and not meta.is_reference_api:
        
        data['predict'] = sum([
            get_fake_api(meta, api_ref) for api_ref in api_reference.all()
        ], [])

        # data['predict'] = []

        if len(data['predict']) == 1 and 'error' in data['predict'][0].keys():
            data['status'] = 'FAILED'
        else:
            #meta.is_reference_api = 1
            #meta.save(update_fields=['is_reference_api'])
            data['status'] = 'OK'
    else:
        data['status'] = 'OK'
    
    return data

def query_meta(meta):

    data = {
        'id': meta.id,
        'name': meta.get_rel_path(),
        'url_meta': meta.get_url_meta(),
        'boxes_position': [
            {
                'tag_label': bb.label.tag_label,
                'type_label': bb.label.type_label,
                'from_id': bb.from_id,
                'to_id': bb.to_id,
                'color': bb.label.color,
                'flag': bb.flag,
                'accept_report_flag': bb.accept_report_flag,
                'position': bb.position,
            } for bb in meta.boxes_position.all()
        ],
        'status': 'OK',
    }

    return data

def query_list_meta(meta):
    data = {}
    mtid = meta.id
    data['tl'] = query_meta(meta)
    data['tr'] = {}
    data['bl'] = {}
    data['br'] = {}

    if meta.is_head:
        try:
            tr = MetaDataModel.objects.get(id=mtid+1)
            if tr.dataset.id == meta.dataset.id:
                data['tr'] = query_meta(tr)
        except:
            pass
        try:
            bl = MetaDataModel.objects.get(id=mtid+2)
            if bl.dataset.id == meta.dataset.id:
                data['bl'] = query_meta(bl)
        except:
            pass
        try:
            br = MetaDataModel.objects.get(id=mtid+3)
            if br.dataset.id == meta.dataset.id:
                data['br'] = query_meta(br)
        except:
            pass
        
        #hard code:
        try:
            pre_meta = MetaDataModel.objects.get(id=mtid-1)
            if pre_meta.dataset.id == meta.dataset.id:
                pre_data = query_meta(pre_meta)
                if len(data['tl']['boxes_position']) == 0:
                    data['tl']['boxes_position'] = pre_data['boxes_position']
        except:
            pass
        #end hard code

    elif meta.is_tail_merger:
        try:
            tr = MetaDataModel.objects.get(id=mtid+1)
            if tr.dataset.id == meta.dataset.id:
                data['tr'] = query_meta(tr)
        except:
            pass
        try:
            bl = MetaDataModel.objects.get(id=mtid+4)
            if bl.dataset.id == meta.dataset.id:
                data['bl'] = query_meta(bl)
        except:
            pass
        try:
            br = MetaDataModel.objects.get(id=mtid+5)
            if br.dataset.id == meta.dataset.id:
                data['br'] = query_meta(br)
        except:
            pass 
    
    return data
