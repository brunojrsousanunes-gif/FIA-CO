(function(){'use strict';
const LANGS=[['es','Español'],['en','English'],['zh-CN','中文'],['hi','हिन्दी'],['ar','العربية'],['fr','Français'],['bn','বাংলা'],['pt','Português'],['ru','Русский'],['id','Bahasa Indonesia']];
const P={
'Casos':['Cases','案例','मामले','الحالات','Cas','কেস','Casos','Сценарии','Kasus'],
'Pagos':['Payments','支付','भुगतान','المدفوعات','Paiements','পেমেন্ট','Pagamentos','Платежи','Pembayaran'],
'Marco':['Framework','框架','ढांचा','الإطار','Cadre','কাঠামো','Quadro','Нормативная база','Kerangka'],
'Arquitectura':['Architecture','架构','आर्किटेक्चर','البنية','Architecture','আর্কিটেকচার','Arquitetura','Архитектура','Arsitektur'],
'App beta':['Beta app','测试版应用','बीटा ऐप','تطبيق تجريبي','App bêta','বেটা অ্যাপ','App beta','Бета-приложение','Aplikasi beta'],
'Probar beta móvil':['Try mobile beta','体验移动测试版','मोबाइल बीटा आज़माएँ','جرّب النسخة المحمولة','Tester la bêta mobile','মোবাইল বেটা চেষ্টা করুন','Testar beta móvel','Попробовать мобильную бету','Coba beta seluler'],
'Confianza · legalidad · innovación':['Trust · legality · innovation','信任 · 合规 · 创新','विश्वास · वैधता · नवाचार','الثقة · الامتثال · الابتكار','Confiance · légalité · innovation','আস্থা · বৈধতা · উদ্ভাবন','Confiança · legalidade · inovação','Доверие · законность · инновации','Kepercayaan · legalitas · inovasi'],
'Acuerdos seguros.':['Secure agreements.','安全协议。','सुरक्षित समझौते।','اتفاقات آمنة.','Accords sécurisés.','নিরাপদ চুক্তি।','Acordos seguros.','Безопасные соглашения.','Kesepakatan aman.'],
'Pagos con confianza.':['Payments with confidence.','可信支付。','विश्वास के साथ भुगतान।','مدفوعات بثقة.','Paiements en confiance.','আস্থার সঙ্গে পেমেন্ট।','Pagamentos com confiança.','Платежи с доверием.','Pembayaran tepercaya.'],
'Probar aplicación beta':['Try beta app','体验测试版应用','बीटा ऐप आज़माएँ','جرّب التطبيق التجريبي','Tester l’app bêta','বেটা অ্যাপ চেষ্টা করুন','Testar app beta','Попробовать бета-приложение','Coba aplikasi beta'],
'Cómo funciona':['How it works','工作原理','यह कैसे काम करता है','كيف يعمل','Comment ça marche','কীভাবে কাজ করে','Como funciona','Как это работает','Cara kerja'],
'Casos de uso':['Use cases','使用场景','उपयोग के मामले','حالات الاستخدام','Cas d’usage','ব্যবহারের ক্ষেত্র','Casos de uso','Сценарии использования','Kasus penggunaan'],
'Una misma estructura para operaciones distintas':['One structure for different operations','一种结构，适用于不同业务','अलग संचालन के लिए एक ढांचा','هيكل واحد لعمليات مختلفة','Une structure pour différentes opérations','বিভিন্ন অপারেশনের জন্য এক কাঠামো','Uma estrutura para operações diferentes','Одна структура для разных операций','Satu struktur untuk berbagai operasi'],
'Pagos entre particulares':['Peer-to-peer payments','个人间支付','व्यक्तियों के बीच भुगतान','مدفوعات بين الأفراد','Paiements entre particuliers','ব্যক্তিগত পেমেন্ট','Pagamentos entre particulares','Платежи между частными лицами','Pembayaran antarindividu'],
'Compraventa':['Purchase and sale','买卖','खरीद-बिक्री','البيع والشراء','Achat-vente','ক্রয়-বিক্রয়','Compra e venda','Купля-продажа','Jual beli'],
'Vehículos':['Vehicles','车辆','वाहन','المركبات','Véhicules','যানবাহন','Veículos','Транспорт','Kendaraan'],
'Conciliación':['Dispute resolution','调解','समाधान','التسوية','Conciliation','সমঝোতা','Conciliação','Урегулирование','Mediasi'],
'Operaciones condicionadas':['Conditional operations','条件交易','सशर्त संचालन','عمليات مشروطة','Opérations conditionnelles','শর্তযুক্ত অপারেশন','Operações condicionadas','Условные операции','Operasi bersyarat'],
'Identidad avanzada':['Advanced identity','高级身份验证','उन्नत पहचान','هوية متقدمة','Identité avancée','উন্নত পরিচয়','Identidade avançada','Расширенная идентификация','Identitas lanjutan'],
'Pagos y transacciones':['Payments and transactions','支付与交易','भुगतान और लेनदेन','المدفوعات والمعاملات','Paiements et transactions','পেমেন্ট ও লেনদেন','Pagamentos e transações','Платежи и транзакции','Pembayaran dan transaksi'],
'Multimétodo, pero no indiscriminado':['Multiple methods, with control','多种方式，受控使用','कई तरीके, नियंत्रित उपयोग','طرق متعددة بضوابط','Plusieurs moyens, sous contrôle','একাধিক পদ্ধতি, নিয়ন্ত্রিত','Vários métodos, com controlo','Несколько методов под контролем','Banyak metode, tetap terkontrol'],
'Transferencia':['Bank transfer','银行转账','बैंक ट्रांसफर','تحويل مصرفي','Virement','ব্যাংক ট্রান্সফার','Transferência','Банковский перевод','Transfer bank'],
'Tarjeta':['Card','银行卡','कार्ड','بطاقة','Carte','কার্ড','Cartão','Карта','Kartu'],
'Wallets y apps':['Wallets and apps','钱包与应用','वॉलेट और ऐप','المحافظ والتطبيقات','Wallets et apps','ওয়ালেট ও অ্যাপ','Carteiras e apps','Кошельки и приложения','Dompet dan aplikasi'],
'Open Banking':['Open Banking','开放银行','ओपन बैंकिंग','الخدمات المصرفية المفتوحة','Open Banking','ওপেন ব্যাংকিং','Open Banking','Открытый банкинг','Open Banking'],
'Criptoactivos':['Crypto-assets','加密资产','क्रिप्टो परिसंपत्तियाँ','الأصول المشفرة','Crypto-actifs','ক্রিপ্টো সম্পদ','Criptoativos','Криптоактивы','Aset kripto'],
'Nuevos métodos':['New methods','新方式','नए तरीके','طرق جديدة','Nouveaux moyens','নতুন পদ্ধতি','Novos métodos','Новые методы','Metode baru'],
'Ver arquitectura de pagos':['View payment architecture','查看支付架构','भुगतान आर्किटेक्चर देखें','عرض بنية المدفوعات','Voir l’architecture de paiement','পেমেন্ট আর্কিটেকচার দেখুন','Ver arquitetura de pagamentos','Смотреть архитектуру платежей','Lihat arsitektur pembayaran'],
'Marco jurídico':['Legal framework','法律框架','कानूनी ढांचा','الإطار القانوني','Cadre juridique','আইনি কাঠামো','Quadro jurídico','Правовая база','Kerangka hukum'],
'Reglas por capas y por operación':['Layered rules for each operation','分层规则，按交易适用','हर संचालन के लिए परतदार नियम','قواعد متعددة الطبقات لكل عملية','Règles par couches et par opération','স্তরভিত্তিক নিয়ম, প্রতি অপারেশন','Regras por camadas e por operação','Правила по уровням и операциям','Aturan berlapis per operasi'],
'Beta móvil':['Mobile beta','移动测试版','मोबाइल बीटा','نسخة محمولة تجريبية','Bêta mobile','মোবাইল বেটা','Beta móvel','Мобильная бета','Beta seluler'],
'Prueba también la aplicación y sus funciones':['Try the app and its features','体验应用及其功能','ऐप और उसकी सुविधाएँ आज़माएँ','جرّب التطبيق وميزاته','Testez aussi l’application et ses fonctions','অ্যাপ ও ফিচারগুলো চেষ্টা করুন','Teste também a aplicação e as funções','Попробуйте приложение и его функции','Coba aplikasi dan fiturnya'],
'Abrir aplicación beta':['Open beta app','打开测试版应用','बीटा ऐप खोलें','فتح التطبيق التجريبي','Ouvrir l’app bêta','বেটা অ্যাপ খুলুন','Abrir app beta','Открыть бета-приложение','Buka aplikasi beta'],
'BETA · SIN DINERO REAL':['BETA · NO REAL MONEY','测试版 · 无真实资金','बीटा · वास्तविक धन नहीं','تجريبي · بدون أموال حقيقية','BÊTA · SANS ARGENT RÉEL','বেটা · বাস্তব অর্থ নয়','BETA · SEM DINHEIRO REAL','БЕТА · БЕЗ РЕАЛЬНЫХ ДЕНЕГ','BETA · TANPA UANG NYATA'],
'Hola, usuario':['Hello, user','你好，用户','नमस्ते, उपयोगकर्ता','مرحباً، المستخدم','Bonjour','হ্যালো, ব্যবহারকারী','Olá, utilizador','Здравствуйте','Halo, pengguna'],
'Saldo demo · Centro de operaciones':['Demo balance · Operations center','演示余额 · 运营中心','डेमो बैलेंस · संचालन केंद्र','رصيد تجريبي · مركز العمليات','Solde démo · Centre d’opérations','ডেমো ব্যালেন্স · অপারেশন সেন্টার','Saldo demo · Centro de operações','Демо-баланс · Центр операций','Saldo demo · Pusat operasi'],
'Enviar':['Send','发送','भेजें','إرسال','Envoyer','পাঠান','Enviar','Отправить','Kirim'],
'Solicitar':['Request','请求','अनुरोध','طلب','Demander','অনুরোধ','Solicitar','Запросить','Minta'],
'Gestionar':['Manage','管理','प्रबंधित करें','إدارة','Gérer','পরিচালনা','Gerir','Управлять','Kelola'],
'Historial':['History','历史','इतिहास','السجل','Historique','ইতিহাস','Histórico','История','Riwayat'],
'¿Qué quieres hacer?':['What would you like to do?','你想做什么？','आप क्या करना चाहते हैं?','ماذا تريد أن تفعل؟','Que voulez-vous faire ?','আপনি কী করতে চান?','O que pretende fazer?','Что вы хотите сделать?','Apa yang ingin Anda lakukan?'],
'Iniciar una gestión':['Start an operation','开始操作','एक प्रक्रिया शुरू करें','بدء عملية','Démarrer une opération','একটি অপারেশন শুরু করুন','Iniciar uma operação','Начать операцию','Mulai operasi'],
'Operaciones recientes':['Recent operations','最近操作','हाल की गतिविधियाँ','العمليات الأخيرة','Opérations récentes','সাম্প্রতিক অপারেশন','Operações recentes','Недавние операции','Operasi terbaru'],
'Inicio':['Home','首页','होम','الرئيسية','Accueil','হোম','Início','Главная','Beranda'],
'Operaciones':['Operations','操作','संचालन','العمليات','Opérations','অপারেশন','Operações','Операции','Operasi'],
'Perfil':['Profile','个人资料','प्रोफ़ाइल','الملف الشخصي','Profil','প্রোফাইল','Perfil','Профиль','Profil'],
'Centro de operaciones':['Operations center','运营中心','संचालन केंद्र','مركز العمليات','Centre d’opérations','অপারেশন সেন্টার','Centro de operações','Центр операций','Pusat operasi'],
'Antes de confirmar':['Before confirming','确认前','पुष्टि से पहले','قبل التأكيد','Avant de confirmer','নিশ্চিত করার আগে','Antes de confirmar','Перед подтверждением','Sebelum mengonfirmasi'],
'Continuar':['Continue','继续','जारी रखें','متابعة','Continuer','চালিয়ে যান','Continuar','Продолжить','Lanjutkan'],
'Volver':['Back','返回','वापस','رجوع','Retour','ফিরে যান','Voltar','Назад','Kembali']
};
const codes=LANGS.map(x=>x[0]); const source=new WeakMap(), attrs=new WeakMap(); let lang='es', applying=false;
function tr(es,code){if(code==='es')return es;const row=P[es];if(!row)return es;const i=codes.indexOf(code)-1;return i>=0&&row[i]||es;}
function rememberText(n){if(!source.has(n))source.set(n,n.nodeValue);}
function applyText(n){rememberText(n);const raw=source.get(n),trim=raw.trim();if(!trim)return;const translated=tr(trim,lang);if(translated===trim){n.nodeValue=raw;return;}n.nodeValue=raw.replace(trim,translated);}
function applyAttrs(el){const names=['aria-label','title','placeholder'];let saved=attrs.get(el);if(!saved){saved={};names.forEach(a=>{if(el.hasAttribute(a))saved[a]=el.getAttribute(a)});attrs.set(el,saved);}Object.keys(saved).forEach(a=>el.setAttribute(a,tr(saved[a],lang)));}
function walk(root){if(root.nodeType===3){applyText(root);return}if(root.nodeType!==1)return;if(['SCRIPT','STYLE','NOSCRIPT'].includes(root.tagName))return;applyAttrs(root);Array.from(root.childNodes).forEach(walk);}
function setLanguage(code){if(!codes.includes(code))code='es';lang=code;localStorage.setItem('fiaco.language',code);document.documentElement.lang=code;document.documentElement.dir=code==='ar'?'rtl':'ltr';applying=true;walk(document.body);document.querySelectorAll('[data-fiaco-lang]').forEach(s=>s.value=code);applying=false;}
function selector(){const s=document.createElement('select');s.className='fiaco-lang';s.setAttribute('data-fiaco-lang','');s.setAttribute('aria-label','Idioma');LANGS.forEach(([c,n])=>{const o=document.createElement('option');o.value=c;o.textContent=n;s.appendChild(o)});s.addEventListener('change',()=>setLanguage(s.value));return s;}
function mount(){const targets=[];document.querySelector('.nav-inner')&&targets.push(document.querySelector('.nav-inner'));document.querySelector('.app-head')&&targets.push(document.querySelector('.app-head'));targets.forEach(t=>{if(!t.querySelector('[data-fiaco-lang]'))t.appendChild(selector())});setLanguage(localStorage.getItem('fiaco.language')||'es');
const mo=new MutationObserver(ms=>{if(applying)return;applying=true;ms.forEach(m=>m.addedNodes.forEach(n=>walk(n)));applying=false});mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();window.FIACOi18n={languages:LANGS,setLanguage,translate:tr};
})();