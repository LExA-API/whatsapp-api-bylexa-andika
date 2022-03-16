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

const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

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
    msg.reply('*Fitur bot di guild $(name)* \n @menu : Menampilkan Semua Keyword Yang Tersedia \n @lvlg : Menampilkan List Leveling 1-240 \n @fasilitas guild : Fasilitas Yang Tersedia Di Guild \n @list buff : List Buff Yang Tersedia Di Guild \n @prof bs :  Lvlg Prof bs 1 - 200 \n @prof synth : Lvlg Prof Synth 1 - 200 \n @mat spot : Spot Farm Material \n @reff : Bahan Getok 0 - S');
  } else if (msg.body == '@reff') {
    msg.reply('*Bahan dan Langkah Refine :* \n \n 0-E Bijih Mithril (No Andeg) \n 0-B Oricalchum/Bijih Mithril (Andeg) \n B-S Material apapun boleh dipakai _*gacha_ (Andeg)');
  } else if (msg.body == '@lvlg') {
    msg.reply("_*Part I*_ \n 1-31 Shell Mask \n 31-30 Pova \n 40-46 Bone Dragonewt A1 \n 46-55 Bone Dragonewt A3 \n 55-65 Flare Volg (Hard) \n 65-78 Flare Volg (NM) \n 78-88 Mochelo (Ulti) \n 88-97 Flare Volg (Ulti) \n 98-104 Don Yeti \n 104-114 Masked Warrior (Ulti) \n 114-124 Cerberus (NM) \n 124-134 Lapin \n 134-145 Cerberus (Ulti) \n 145-148 Bexiz (Ulti) \n 148-153 Commander Golem \n 153-164 Venena (Hard) \n 164-179 Venena (NM) \n 179-182 Altoblepas \n 182-199 Venena (Ulti) \n 199-202 Frenzy Viola \n 202-212 Finstern (Ulti) \n 212-220 Kuzto \n 220-230 Gravicep");
  } else if (msg.body == '@list buff') {
    msg.reply('Untuk Kelengkapan Food Buff Yang Tersedia DI Guild Kami Untuk Saat Ini \n Hanya tersedia: \n - Weapon Attack Lv8 ( RaffiAS ) \n - Str Lv8 ( KAREMO ) \n - Ampr Lv7 ( Dark Eve ) \n - Magic Attack Lv7 ( JerryRS ) \n - Max Hp Lv8 ( Hestiii ) \n - Critical Rate Lv5 ( Killey31 ) \n - Physical Resist Lv6 ( Reiki ) \n - Max Mp Lv6 ( LExA_Ass)');
  } else if (msg.body == '@halo sayang') {
    msg.reply('hai juga');
  } else if (msg.body == '@prof bs') {
    msg.reply('List Leveling Lv proff \n \n ° 1-10(pedang kayu) \n ° 11-25(1h gladius pedang rusak x20 + gigi bergerigi x20) \n ° 25-50(1h rapier pasir halus x5 + tulang naga x30) \n ° 50-70(1h pyhto blade mahkota sabana x1 + sisik sabana x5) \n ° 70-90(1h pedang indigo sirip panas x20 + pedang cacat x5) \n ° 90-100(bow death eater C.kepala cerbe x2 + rantai penyucian x1) \n ° 100-130(2h waldfee batu C.mistis x2 + batu bersihir x1) \n ° 130-140(Hb baskara prasasti bersina x5 + halo terputus x20) \n ° 140-150(tombak ignis, kristal merah darah x5+gigi depan patah x25) \n \n *Diff 150* \n \n ° Tongkat jamur berkilau (bos Shampy di tambang turnus) \n ° Tongkat syaman (mob Roca di jalan eryldan, mob Soul reaper di kuil naga kegelapan) \n \n *Diff 160* \n \n ° Busur algojo (mob Laurus di distrik labilans (mob rentan hilang, jadi butuh party minimal 2 anggota), mob Tentakel aneh di pos depan plastida (farmlah di area ketiga dan menghadaplah ke portal dimana anda masuk agar mob tidak hilang)) \n ° Zirah malaikat perang kagura (bos Mardula di serambi dewa berkah) \n \n *Diff 165* \n \n ° Pedang taring naga kegelapan (bos Finstern si naga kegelapan di kuil naga kegelapan (break bagian tubuhnya)) \n ° Katana cakar naga (bos Finstern si naga kegelapan di kuil naga kegelapan (break bagian tubuhnya)) \n \n *Diff 170* \n \n ° Busur Nurwulan (bos Pilz erosi di bongkahan morthell (break bagian tubuh)) \n ° Tombak kraman (bos Pilz erosi di bongkahan morthell (break bagian tubuh)) \n \n *Diff 180* \n \n ° Pedang jet indigo (bos Pyxtica di distrik fractum (break bagian tubuhnya) (Bos Rumit!)) \n ° Rilevatore (bos Pyxtica di distrik fractum (break bagian tubuhnya)(Bos Rumit!)) \n ° Gada Safir (bos Roga Safir di Pos Depan Plastida (break kepala)) (Agak repot, butuh party) \n ° Katana Lamina Penusnah (bos Gravicep di Distrik Recetacula: Atap Depot (break bagian tubuh)) \n ° Tongkat Lempeng Fana (bos Gravicep di Distrik Recetacula: Atap Depot (break bagian tubuh)) \n \n *Diff 185* \n \n ° Zirah Pepagan (bos Kuzto di Distrik Labilans: Alun-alun (break bagian tubuhnya untuk mendapatkan item Kacang Mistis)) \n \n *Diff 180 - 200* \n \n Ghoulfish War Hammer (bos Pistesius di Pesisir Ducia : Area Ujung (Lupa break bagian apa h3he))');
  } else if (msg.body == '@mat spot') {
    msg.reply('*Spot Farming Semua Material* \n \n Kayu : Ivy (Lv 150) Kuil Naga Kegelapan : Bawah \n Kain : Potum Semedi (Lv 132) Koridor Heresi \n Obat : Grape Jelly (Lv 110) Saluran Bawah Tanah Ultimea : Tenggara \n Fauna : Boar (Lv 97) Lembah Dalam Sykea \n Logam : Malaikat Gelembung (Lv 143) Kuil Para Dewa : Area 2 \n Mana : Summer Shell (Event Musim Panas) Semua Mob Berunsur Air');
  } else if (msg.body == '@fasilitas guild') {
    msg.reply('Untuk Fasilitas Yang Tersedia Di  Guild \n Kami: \n -Free Lock 4 \n -Refine +B ( bahan bawa sendiri ) \n -Fillstat ( bahan bawa sendiri ) \n -Server Discord(https://discord.gg/FafANBZenS) \n -Grup Chat Whatsapp \n -Bot Whatsapp');
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
