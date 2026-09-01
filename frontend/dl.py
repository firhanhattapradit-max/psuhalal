import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/114.0.0.0 Safari/537.36'}

def dl(url, name):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = response.read()
            with open(name, 'wb') as f:
                f.write(data)
            print(name, 'size:', len(data))
    except Exception as e:
        print('Failed', name, e)

dl('https://s.isanook.com/tr/0/ud/282/1410145/1410145-20201021115201-ab2ed0a.jpg', './public/images/places/nr_souvenirs_0_new.jpg')
dl('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Kolae_Boat.jpg/1280px-Kolae_Boat.jpg', './public/images/places/nr_souvenirs_2_new.jpg')
dl('https://f.ptcdn.info/436/049/000/omuym29fbbgW4Z4r1Y3s-o.jpg', './public/images/places/nr_souvenirs_3_new.jpg')
dl('https://www.museumthailand.com/upload/evidence/1531206122_60100.jpg', './public/images/places/nr_souvenirs_4_new.jpg')
dl('https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Lekor.jpg/1200px-Lekor.jpg', './public/images/places/nr_souvenirs_6_new.jpg')
