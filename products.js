const products = [
    // Хлеб
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Дарницкий", desc: "Классический ржано-пшеничный", price: 100, weight: "500 г", img: "https://i.ibb.co/mV675qBf/image.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Ржаной", desc: "Натуральная закваска", price: 100, weight: "500 г", img: "https://i.ibb.co/kgnWr2qp/image.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Бородинский", desc: "С кориандром и пряностями", price: 100, weight: "500 г", img: "https://i.ibb.co/Z6L1cBh6/image.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Рижский с тмином", desc: "Ароматный заварной хлеб", price: 100, weight: "500 г", img: "https://i.ibb.co/GfFdS8RL/IMG-5176.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Томатный", desc: "С вялеными томатами", price: 100, weight: "400 г", img: "https://i.ibb.co/GQbhn0BG/image.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Гречишный", desc: "Полезный гречневый хлеб", price: 100, weight: "500 г", img: "https://i.ibb.co/H8kHTCr/IMG-5177.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "С оливками", desc: "С вялеными оливками", price: 100, weight: "500 г", img: "https://i.ibb.co/n86Y13xh/image.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Луковый", desc: "С обжаренным луком", price: 100, weight: "500 г", img: "https://i.ibb.co/xS68YCdK/image.png" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "Зерновой", desc: "Микс полезных семян", price: 100, weight: "500 г", img: "https://i.ibb.co/C3gpbwWW/IMG-5178.jpg" },
    { category: "🥖 Хлеб (Весь хлеб на закваске!)", name: "С морковью и изюмом", desc: "Сладковатый мякиш", price: 100, weight: "450 г", img: "https://i.ibb.co/rRqG8hMq/image.jpg" },

    // Пироги и закуски
    { category: "🥧 Пироги и закуски", name: "Киш с рыбой", desc: "Заливка, красная рыба", price: 250, weight: "820 г", img: "https://i.ibb.co/d0MqgdZV/image.jpg" },
    { category: "🥧 Пироги и закуски", name: "Пирог с капустой", desc: "Сочная начинка", price: 200, weight: "820 г", img: "https://i.ibb.co/7t8Cfs5M/IMG-5179.jpg" },
    { category: "🥧 Пироги и закуски", name: "Печеночные оладьи", desc: "Нежные и домашние", price: 150, weight: "450 г", img: "https://i.ibb.co/nshPggVc/IMG-5180.jpg" },
    { category: "🥧 Пироги и закуски", name: "Блинчики с фаршем", desc: "Сытные домашние", price: 300, weight: "500 г", img: "https://i.ibb.co/qMSsfC52/IMG-5181.jpg" },
    { category: "🥧 Пироги и закуски", name: "Блинчики пустые", desc: "Тонкие и румяные", price: 100, weight: "12 шт", img: "https://i.ibb.co/TqWYcK93/IMG-5182.jpg" },

    // Сладкая выпечка и печенье
    { category: "🍪 Сладкая выпечка и печенье", name: "Сырники творожные", desc: "Из натурального творога", price: 250, weight: "400 г", img: "https://i.ibb.co/0vLB3WZ/IMG-5183.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Кекс с маком", desc: "Рассыпчатый", price: 150, weight: "500 г", img: "https://i.ibb.co/gn4xsjq/image.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Кекс с изюмом", desc: "С цедрой и изюмом", price: 150, weight: "500 г", img: "https://i.ibb.co/gn4xsjq/image.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Банановый пирог", desc: "Влажный мякиш", price: 200, weight: "500 г", img: "https://i.ibb.co/Y7fQkYsq/image.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Печенье арахисовое", desc: "Хрустящее", price: 150, weight: "400 г", img: "https://i.ibb.co/DP46hNVg/IMG-5187.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Печенье имбирное", desc: "Пряное", price: 150, weight: "450 г", img: "https://i.ibb.co/SDkJ9WKh/image.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Печенье ассорти", desc: "Имбирное и арахисовое", price: 150, weight: "400 г", img: "https://i.ibb.co/Fb1QHsKF/image.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Бискотти с сыром", desc: "С сыром и орехами", price: 200, weight: "400 г", img: "https://i.ibb.co/hJ7typVR/IMG-5186.jpg" },
    { category: "🍪 Сладкая выпечка и печенье", name: "Овсяное с изюмом", desc: "Домашнее", price: 150, weight: "400 г", img: "https://i.ibb.co/tPsGWkS8/IMG-5184.jpg" },

    // Соленья
    { category: "🥒 Соленья", name: "Капуста квашеная", desc: "Хрустящая", price: 150, weight: "1000 г", img: "https://i.ibb.co/sdXCtNF9/image.png" },
    { category: "🥒 Соленья", name: "Морковь по-корейски", desc: "Пикантная", price: 150, weight: "1000 г", img: "https://i.ibb.co/Jwv5PFWH/IMG-5185.jpg" }
];
