const { Client, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fs = require('fs');
const { phoneNumberFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');

const port = process.env.PORT || 8989;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: true
}));


app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  session: sessionCfg
});

client.on('message', msg => {
  if (msg.body == '@ping!') {
    msg.reply('pong');
  } else if (msg.body == '@good morning') {
    msg.reply('selamat pagi');
  } else if (msg.body == '@menu') {
    msg.reply('[ Menu ] \n *Fitur Bot Di Guild* \n \n \n [ Leveling ] \n *List Leveling Mobs/Skills* \n > @prof smith \n > @prof synth \n > @lvlg char \n > @lvlg bag \n \n \n [ Fasilitas Guild ] \n *Jasa dan Fasilitas Guild* \n > @list buff \n > @seller spina \n > @media guild \n > @service \n \n \n [ Random ] \n *Info Seputar Toram* \n > @mat spot \n > @pet \n > @xtall \n \n _*Jika bot tidak menjawab, artinya bot sedang offline_');
  } else if (msg.body == '@reff') {
    msg.reply('*Bahan dan Langkah Refine :* \n \n 0-E Bijih Mithril (No Andeg) \n 0-B Oricalchum/Bijih Mithril (Andeg) \n B-S Material apapun boleh dipakai _*gacha_ (Andeg)');
  } else if (msg.body == '@lvlg char') {
    msg.reply('*List Leveling 1-240* \n \n \n _> 1-36 :_ Nisel Mask (Gunung Nisel : Area Lereng) 🟠 \n \n _> 36-57 :_ Bone Dragonewt (Makam Ratu : Area 1) ⚫ \n \n _ > 57-67 :_ Flare Volg *Hard* (Lereng Merapi : Jejak Lava) 🔴 \n \n _> 67-74 :_ Flare Volg *Nightmare* (Lereng Merapi : Jejak Lava) 🔴 \n \n _> 74-80 :_ Pendekar Bertopeng *Hard* (Tanah Pertanian : Tanah Tinggi) 🔴 \n \n _> 84-96 :_ Pendekar Bertopeng *Nightmare* (Tanah Pertanian : Tanah Tinggi) 🔴 \n \n _> 96-110 :_ Don Yeti (Lembah Es Polde) 🟠 \n \n _> 110-128 :_ Cerberus *Nightmare* (Mata Air Kelahiran : Puncak) 🔵 \n \n _> 128-140 :_ Cerberus *Ultimate* (Mata Air Kelahiran : Puncak) 🔵 \n \n _> 140-148 :_ Odelon Machina (Pabrik Demi Machina Besar : Area 2) ⚪ \n \n _> 148-157 :_ Komandan Golem (Mansion Lufenas : Pintu Masuk) ⚫ \n \n _> 157-162 :_ Venena Coenubia *Hard* (Istana Ultimea : Takhta) 🔴 \n \n _> 162-180 :_ Venena Coenubia *Nightmare* (Istana Ultimea : Takhta) 🔴 \n \n _> 180-200 :_ Venena Coenubia *Ultimate* (Istana Ultime : Takhta) 🔴 \n \n _> 200-215 :_ Finstern si Naga Kegelapan *Ultimate* (Istana Naga Kegelapan : Dekat Puncak) ⚫ \n \n _> 215-220 :_ Kuzto *Ultimate* (Distrik Labilans : Alun-alun) 🟠 \n \n _> 220-230 :_ Roh Orang Mati (Lembah Arche : Area 1) ⚫ \n \n _> 230-240 :_ Arachnidemon *Ultimate* (Lembah Arche : Area Terdalam) ⚫ \n \n \n *Spot Alternatif :* \n \n _> 70-96 :_ Quest "Kesalahan Pemabuk" pada npc Ravagne (El Scaro) 🟠 \n \n _> 120-130 :_ Dukun Lapin (Sungai Kegelapan) ⚫ \n \n _> 178-182 :_ Altoblepas (Dataran Rokoko) 🟢 \n \n _> 200-220 :_ Finstern Si Naga Kegelapan *Ultimate* (Kuil Naga Kegelapan : Dekat Puncak) ⚫ \n \n \n \n \n *Penjelasan :* \n 🔴 > Elemen Api \n 🟠 > Elemen Bumi \n 🔵 > Elemen Air \n ⚫ > Elemen Gelap \n ⚪ > Elemen Cahaya \n 🟢 > Elemen Netral');
  } else if (msg.body == '@list buff') {
    msg.reply('*Untuk Kelengkapan Food Buff Yang Tersedia DI Guild Kami Untuk Saat Ini:* \n \n Hanya tersedia: \n - Weapon Attack Lv8 ( RaffiAS ) \n - Str Lv8 ( KAREMO ) \n - Ampr Lv7 ( Dark Eve ) \n - Magic Attack Lv8 ( JerryRS ) \n - Max Hp Lv8 ( Hestiii ) \n - Critical Rate Lv6 ( Killey31 ) \n - Critical Rate Lv7 (yllwclw) \n - Physical Resist Lv6 ( Reiki ) \n - Max Mp Lv6 ( LExA_Ass) \n - Max Mp Lv9 (Shirou Kusanagi) \n - Aggro Lv8 ( ☂️{ F i L O } ☁️) \n - Int Lv7 (AE)');
  } else if (msg.body == '@prof synth') {
    msg.reply('*List Leveling Lv profiency Synthesis* \n \n > Level 1-10 (Revita I) \n > Level 10-30 (Revita II) \n > Level 30-50 (Revita III) \n > Level 50-80 (Revita IV) \n > Level 80-100 (Revita V) \n > Level 100-150 (Madu Enak) \n > Level 150-200 (Oricalchum Murni)');
  } else if (msg.body == '@halo sayang') {
    msg.reply('hai juga');
  } else if (msg.body == '@seller spina') {
    msg.reply('*Para Seller Spina Yang Tergabung Didalam Guild :* \n \n - @jerry \n - @sapior');
  } else if (msg.body == 'siapa ayunda?') {
    msg.reply('*ayunda adalah system bot guild Re:Union yang di kembangkan oleh leader guild RaffiAS tehe🤪*');
  } else if (msg.body == '@xtall') {
    msg.reply('*List Rekomendasi Xtall Beserta Upgradenya :* \n \n _>>> DPS XTALL <<<_ \n \n *Vulture :* \n Ganglef✅ \n Machina Tiran✅ \n \n *Agelada :* \n Metal Stinger✅ \n Kapten Lyark✅ \n \n *Bayangan Hitam :* \n Decel✅ \n York✅ \n Tuscog✅ \n \n *Gemma :* \n Cerberus✅ \n Pyxtica✅ \n \n *Rephton :* \n Zolban✅ \n \n *Hexter :* \n Ksatria Buruk Dusta✅ \n Gwaimol✅ \n \n *Velum :* \n Imitator✅ \n Mardula✅ \n \n *Baphomela :* \n Naga Senja✅ \n \n *Venena ll :* \n Venena l✅ \n \n *Mega Alpoca :* \n Celeng Raksasa✅ \n \n *Raja Kegelapan :* \n Ayah Yashiro Azuki✅ \n \n *Rhinosour :* \n Minotaur✅ \n \n *Machina Ultima :* \n Golem Pilar✅ \n \n *Roh Orang Mati :* \n Baron bling-bling✅ \n \n *Raja Piton :* \n Warmonger✅ \n Proto Leon✅ \n \n *Mata Jahannam :* \n Quasar Jahannam✅ \n \n *Pret :* \n Odelon Machina✅ \n \n *Usamochi :* \n Usakichi✅ \n Usami✅ \n \n *Gordo :* \n Naga Sabana Yelb✅ \n Roda Kelana✅ \n \n \n _>>> TANK XTALL <<<_ \n \n *Mama Fluck :* \n Ifrid✅ \n \n *Trokostida :* \n Dusk Machina✅ \n \n *Memec :* \n Tentara Batu✅ \n \n *Yuveria :* \n Gopherga✅ \n \n *Seraph Machina :* \n Coryn Besar✅ \n \n \n _>>> MAGE XTALL <<<_ \n \n *Finstern :* \n Imitacia✅ \n \n *Momok Gelembung :* \n Mbah Dukun Usasama✅ \n \n *Guignol :* \n Nurethoth✅ \n \n *Lalvada :* \n Ooze✅');
  } else if (msg.body == '@pet') {
    msg.reply('*Daftar Lengkap Pet Toram :* \n \n > @lvlg pet \n > @status pet \n > @sifat bonus');
  } else if (msg.body == '@lvlg pet') {
    msg.reply('*List Leveling Pet :* \n \n LVL 1 - 50 Masked Warrior Normal/Hard \n LVL 50 - 80 Masked Warrior Nightmare \n LVL 80 - 90 Masked Warrior Ultimate \n LVL 90 - 110 Cerberus Nightmare \n LVL 110 - 150 Cerberus Ultimate \n LVL 150 - 160 Venena Nightmare \n LVL 160 - 200 Venena Ulti');
  } else if (msg.body == '@media guild') {
    msg.reply('*Sosial Media Guild Re:Union :* \n \n - Discord : https://discord.gg/FafANBZenS \n - Instagram: https://www.instagram.com/re.union._/ \n Youtube : https://www.youtube.com/channel/UCYHVbLoQKHUKrYfTj31lbBg');
  } else if (msg.body == '@jerry') {
    msg.reply('*+ Miku Store List +* \n - Jasa All Material √ (Mana only opened summer event) (100/day) \n - S) Lock 4 (Reset) \n - S) Bwing Service 100/day √ \n - S) Jasa Mq skip/ No Skip \n - S) Spina √ \n - S) SS HV MORE √ \n - S) Reff Service 0 - B \n - S) Acc Avatar Subaru+Felt (Re:Zero) no cap/mq \n - S) Dte Bumi Lv7 \n - \n - \n No WA: http://wa.me/6289668162848 \n My Fb: https://m.facebook.com/profile.php?id=100056038733948&ref=content_filter');
  } else if (msg.body == '@sapior') {
    msg.reply('_Pengen jadi elite?_ \n _Pengen punya couple?_ \n _Atau pengen ngehode tapi gak ada spina?_ \n \n Xavior store solusinya: \n ✅ Trusted \n ✅ Rate Kekeluargaan \n ✅ Halal (hasil mulung) \n \n Melayani 24 jam selama tidak ketiduran, pm langsung untuk fast respon. \n \n *Noted: Xavior shop sudah berpengalaman selama hampir 5 tahun, intinya udah kebal PHP😇*');
  } else if (msg.body == '@service') {
    msg.reply('*Service Yang Tersedia Di Guild :* \n \n - Free Lock 4 \n - Refine +B \n - Fillstat cr23');
  } else if (msg.body == '@prof smith') {
    msg.reply('*List Leveling profiency Blacksmith* \n \n ° 1-10(pedang kayu) \n ° 11-25(1h gladius pedang rusak x20 + gigi bergerigi x20) \n ° 25-50(1h rapier pasir halus x5 + tulang naga x30) \n ° 50-70(1h pyhto blade mahkota sabana x1 + sisik sabana x5) \n ° 70-90(1h pedang indigo sirip panas x20 + pedang cacat x5) \n ° 90-100(bow death eater C.kepala cerbe x2 + rantai penyucian x1) \n ° 100-130(2h waldfee batu C.mistis x2 + batu bersihir x1) \n ° 130-140(Hb baskara prasasti bersina x5 + halo terputus x20) \n ° 140-150(tombak ignis, kristal merah darah x5+gigi depan patah x25) \n \n *Diff 150* \n \n ° Tongkat jamur berkilau (bos Shampy di tambang turnus) \n ° Tongkat syaman (mob Roca di jalan eryldan, mob Soul reaper di kuil naga kegelapan) \n \n *Diff 160* \n \n ° Busur algojo (mob Laurus di distrik labilans (mob rentan hilang, jadi butuh party minimal 2 anggota), mob Tentakel aneh di pos depan plastida (farmlah di area ketiga dan menghadaplah ke portal dimana anda masuk agar mob tidak hilang)) \n ° Zirah malaikat perang kagura (bos Mardula di serambi dewa berkah) \n \n *Diff 165* \n \n ° Pedang taring naga kegelapan (bos Finstern si naga kegelapan di kuil naga kegelapan (break bagian tubuhnya)) \n ° Katana cakar naga (bos Finstern si naga kegelapan di kuil naga kegelapan (break bagian tubuhnya)) \n \n *Diff 170* \n \n ° Busur Nurwulan (bos Pilz erosi di bongkahan morthell (break bagian tubuh)) \n ° Tombak kraman (bos Pilz erosi di bongkahan morthell (break bagian tubuh)) \n \n *Diff 180* \n \n ° Pedang jet indigo (bos Pyxtica di distrik fractum (break bagian tubuhnya) (Bos Rumit!)) \n ° Rilevatore (bos Pyxtica di distrik fractum (break bagian tubuhnya)(Bos Rumit!)) \n ° Gada Safir (bos Roga Safir di Pos Depan Plastida (break kepala)) (Agak repot, butuh party) \n ° Katana Lamina Penusnah (bos Gravicep di Distrik Recetacula: Atap Depot (break bagian tubuh)) \n ° Tongkat Lempeng Fana (bos Gravicep di Distrik Recetacula: Atap Depot (break bagian tubuh)) \n \n *Diff 185* \n \n ° Zirah Pepagan (bos Kuzto di Distrik Labilans: Alun-alun (break bagian tubuhnya untuk mendapatkan item Kacang Mistis)) \n \n *Diff 180 - 200* \n \n Ghoulfish War Hammer (bos Pistesius di Pesisir Ducia : Area Ujung (Lupa break bagian apa h3he))');
  } else if (msg.body == '@mat spot') {
    msg.reply('*Spot Farming Semua Material* \n \n *- Kayu :* Ivy (Lv 150) Kuil Naga Kegelapan : Bawah \n *- Kain :* Potum Semedi (Lv 132) Koridor Heresi \n *- Obat :* Grape Jelly (Lv 110) Saluran Bawah Tanah Ultimea : Tenggara \n *- Fauna :* Boar (Lv 97) Lembah Dalam Sykea \n *- Logam :* Malaikat Gelembung (Lv 143) Kuil Para Dewa : Area 2 \n *- Mana :* Summer Shell (Event Musim Panas) Semua Mob Berunsur Air \n \n _*Alternatif Tempat Lain Jika Map Tersebut Sedang Sepi_ \n \n *- Mana :* Venena Coenubia/Meta (proc weapon drop) Istana Ultimea : Takhta \n *- Fauna :* Underground Nemico (Lv 109) Saluran Bawah Tanah Ultimea : Tenggara');
  } else if (msg.body == '@fasilitas guild') {
    msg.reply('*Untuk Fasilitas Yang Tersedia Di  Guild Kami:* \n -Free Lock 4 \n -Refine +B ( bahan bawa sendiri ) \n -Fillstat ( bahan bawa sendiri ) \n -Server Discord(https://discord.gg/FafANBZenS) \n -Grup Chat Whatsapp \n -Bot Whatsapp');
  } else if (msg.body == '@groups') {
    client.getChats().then(chats => {
      const groups = chats.filter(chat => chat.isGroup);

      if (groups.length == 0) {
        msg.reply('You have no group yet.');
      } else {
        let replyMsg = '*YOUR GROUPS*\n\n';
        groups.forEach((group, i) => {
          replyMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
        });
        replyMsg += '_You can use the group id to send a message to the group._'
        msg.reply(replyMsg);
      }
    });
  }

  // Downloading media
  if (msg.hasMedia) {
    msg.downloadMedia().then(media => {
      // To better understanding
      // Please look at the console what data we get
      console.log(media);

      if (media) {
        // The folder to store: change as you want!
        // Create if not exists
        const mediaPath = './downloaded-media/';

        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }

        // Get the file extension by mime-type
        const extension = mime.extension(media.mimetype);
        
        // Filename: change as you want! 
        // I will use the time for this example
        // Why not use media.filename? Because the value is not certain exists
        const filename = new Date().getTime();

        const fullFilename = mediaPath + filename + '.' + extension;

        // Save to file
        try {
          fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' }); 
          console.log('File downloaded successfully!', fullFilename);
        } catch (err) {
          console.log('Failed to save the file:', err);
        }
      }
    });
  }
});

client.initialize();

// Socket IO
io.on('connection', function(socket) {
  socket.emit('message', 'Connecting...');

  client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code received, scan please!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  client.on('authenticated', (session) => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
      if (err) {
        console.error(err);
      }
    });
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'Whatsapp is disconnected!');
    fs.unlinkSync(SESSION_FILE_PATH, function(err) {
        if(err) return console.log(err);
        console.log('Session file deleted!');
    });
    client.destroy();
    client.initialize();
  });
});


const checkRegisteredNumber = async function(number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}

// Send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Send media
app.post('/send-media', async (req, res) => {
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  // const media = MessageMedia.fromFilePath('./image-example.png');
  // const file = req.files.file;
  // const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name);
  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

const findGroupByName = async function(name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat => 
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
    );
  });
  return group;
}

// Send message to group
// You can use chatID or group name, yea!
app.post('/send-group-message', [
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  let chatId = req.body.id;
  const groupName = req.body.name;
  const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// Clearing message on spesific chat
app.post('/clear-message', [
  body('number').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  const chat = await client.getChatById(number);
  
  chat.clearMessages().then(status => {
    res.status(200).json({
      status: true,
      response: status
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  })
});

server.listen(port, function() {
  console.log('App running on *: ' + port);
});
