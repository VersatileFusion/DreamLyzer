# Dreamlyzer: Dream Journal and Analysis API | دریم‌لایزر: ای‌پی‌آی ثبت و تحلیل رویاها

## English | انگلیسی

Dreamlyzer is a digital dream journal API that helps users track, analyze, and gain insights from their dreams. The application analyzes dream content to extract keywords, identify emotions, and recognize common dream symbols, providing users with a deeper understanding of their subconscious mind.

## فارسی | Persian

دریم‌لایزر یک ای‌پی‌آی دفترچه دیجیتال رویاها است که به کاربران کمک می‌کند رویاهای خود را ثبت، تحلیل و از آن‌ها بینش کسب کنند. این برنامه محتوای رویاها را تحلیل می‌کند تا کلمات کلیدی را استخراج کند، احساسات را شناسایی کند و نمادهای رایج رویا را تشخیص دهد، و به کاربران درک عمیق‌تری از ذهن ناخودآگاه خود ارائه می‌دهد.

---

## Author | نویسنده

**Erfan Ahmadvand**  
Phone | تلفن: +989109924707

---

## Features | ویژگی‌ها

### English | انگلیسی

- **User Authentication**: Register and login to access your personal dream journal
- **Dream Management**: Create, read, update, and delete dream entries
- **Automated Analysis**: 
  - Extracts important keywords from dream content
  - Analyzes emotional tone (positive, negative, neutral)
  - Identifies common dream symbols and their meanings
- **Statistics**: Get insights about patterns in your dreams over time
- **API Documentation**: Interactive Swagger documentation for all endpoints

### فارسی | Persian

- **احراز هویت کاربر**: ثبت‌نام و ورود برای دسترسی به دفترچه رویاهای شخصی
- **مدیریت رویاها**: ایجاد، خواندن، به‌روزرسانی و حذف ورودی‌های رویا
- **تحلیل خودکار**: 
  - استخراج کلمات کلیدی مهم از محتوای رویا
  - تحلیل لحن احساسی (مثبت، منفی، خنثی)
  - شناسایی نمادهای رایج رویا و معانی آن‌ها
- **آمار**: دریافت بینش‌هایی درباره الگوهای رویاهای شما در طول زمان
- **مستندات API**: مستندات تعاملی Swagger برای تمام نقاط پایانی

---

## Tech Stack | تکنولوژی‌ها

### English | انگلیسی

- **Backend**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Natural Language Processing**: Natural.js library for text analysis
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

### فارسی | Persian

- **بک‌اند**: Express.js (Node.js)
- **پایگاه داده**: MongoDB با Mongoose ODM
- **پردازش زبان طبیعی**: کتابخانه Natural.js برای تحلیل متن
- **احراز هویت**: JWT (توکن‌های وب JSON)
- **مستندات API**: Swagger/OpenAPI

---

## Getting Started | شروع کار

### Prerequisites | پیش‌نیازها

#### English | انگلیسی

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- pnpm package manager

#### فارسی | Persian

- Node.js (نسخه 14 یا بالاتر)
- MongoDB (محلی یا Atlas)
- مدیر بسته pnpm

### Installation | نصب

#### English | انگلیسی

1. Clone the repository
   ```
   git clone https://github.com/yourusername/dreamlyzer.git
   cd dreamlyzer
   ```

2. Install dependencies
   ```
   pnpm install
   ```

3. Create a .env file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dreamlyzer
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server
   ```
   pnpm dev
   ```

5. The server will be running at http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

#### فارسی | Persian

1. کلون کردن مخزن
   ```
   git clone https://github.com/yourusername/dreamlyzer.git
   cd dreamlyzer
   ```

2. نصب وابستگی‌ها
   ```
   pnpm install
   ```

3. ایجاد فایل .env در دایرکتوری اصلی با متغیرهای زیر:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dreamlyzer
   JWT_SECRET=your_jwt_secret_key
   ```

4. شروع سرور توسعه
   ```
   pnpm dev
   ```

5. سرور در http://localhost:5000 اجرا خواهد شد
   - مستندات API: http://localhost:5000/api-docs

---

## API Endpoints | نقاط پایانی API

### Authentication | احراز هویت

#### English | انگلیسی

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (requires authentication)

#### فارسی | Persian

- `POST /api/users/register` - ثبت‌نام کاربر جدید
- `POST /api/users/login` - ورود کاربر
- `GET /api/users/profile` - دریافت پروفایل کاربر (نیاز به احراز هویت)

### Dreams | رویاها

#### English | انگلیسی

- `POST /api/dreams` - Create a new dream entry
- `GET /api/dreams` - Get all dreams for current user
- `GET /api/dreams/:id` - Get a specific dream by ID
- `PUT /api/dreams/:id` - Update a dream entry
- `DELETE /api/dreams/:id` - Delete a dream entry
- `GET /api/dreams/stats` - Get statistics about user's dreams

#### فارسی | Persian

- `POST /api/dreams` - ایجاد یک ورودی رویای جدید
- `GET /api/dreams` - دریافت تمام رویاهای کاربر فعلی
- `GET /api/dreams/:id` - دریافت یک رویای خاص با شناسه
- `PUT /api/dreams/:id` - به‌روزرسانی یک ورودی رویا
- `DELETE /api/dreams/:id` - حذف یک ورودی رویا
- `GET /api/dreams/stats` - دریافت آمار درباره رویاهای کاربر

---

## Development | توسعه

### Running in Development Mode | اجرا در حالت توسعه

#### English | انگلیسی

```
pnpm dev
```

This uses nodemon to automatically restart the server when changes are detected.

#### فارسی | Persian

```
pnpm dev
```

این از nodemon استفاده می‌کند تا زمانی که تغییرات شناسایی شوند، سرور را به صورت خودکار راه‌اندازی مجدد کند.

### Running in Production Mode | اجرا در حالت تولید

#### English | انگلیسی

```
pnpm start
```

#### فارسی | Persian

```
pnpm start
```

---

## Architecture | معماری

### English | انگلیسی

The project follows a modular architecture:

- **Models**: MongoDB schemas and models
- **Routes**: API endpoints and request handlers
- **Utils**: Utility functions for dream analysis
- **Middleware**: Authentication and validation middleware

### فارسی | Persian

این پروژه از یک معماری ماژولار پیروی می‌کند:

- **مدل‌ها**: طرح‌های MongoDB و مدل‌ها
- **مسیرها**: نقاط پایانی API و پردازشگرهای درخواست
- **ابزارها**: توابع کمکی برای تحلیل رویا
- **میان‌افزار**: میان‌افزار احراز هویت و اعتبارسنجی

---

## Dream Analysis | تحلیل رویا

### English | انگلیسی

Dreamlyzer uses natural language processing to analyze dream content:

1. **Keyword Extraction**: Extracts significant words by filtering out common stop words and ranking by frequency
2. **Emotion Analysis**: Evaluates the emotional tone by examining positive, negative, and neutral emotion words
3. **Symbol Recognition**: Identifies common dream symbols (e.g., flying, water, snakes) and provides their potential meanings

### فارسی | Persian

دریم‌لایزر از پردازش زبان طبیعی برای تحلیل محتوای رویا استفاده می‌کند:

1. **استخراج کلمات کلیدی**: کلمات مهم را با فیلتر کردن کلمات توقف رایج و رتبه‌بندی بر اساس فراوانی استخراج می‌کند
2. **تحلیل احساسات**: لحن احساسی را با بررسی کلمات احساسی مثبت، منفی و خنثی ارزیابی می‌کند
3. **تشخیص نماد**: نمادهای رایج رویا (مانند پرواز، آب، مار) را شناسایی می‌کند و معانی بالقوه آن‌ها را ارائه می‌دهد

---

## Future Enhancements | بهبودهای آینده

### English | انگلیسی

- Machine learning models for more sophisticated dream analysis
- Community features to share and discuss dreams anonymously
- Integration with sleep trackers
- Mobile app frontend
- Enhanced statistics and visualizations

### فارسی | Persian

- مدل‌های یادگیری ماشین برای تحلیل پیچیده‌تر رویا
- ویژگی‌های اجتماعی برای به اشتراک گذاشتن و بحث درباره رویاها به صورت ناشناس
- یکپارچه‌سازی با ردیاب‌های خواب
- فرانت‌اند اپلیکیشن موبایل
- آمار و تجسم‌های پیشرفته

---

## License | مجوز

### English | انگلیسی

This project is licensed under the MIT License - see the LICENSE file for details.

### فارسی | Persian

این پروژه تحت مجوز MIT ارائه شده است - برای جزئیات به فایل LICENSE مراجعه کنید.

---

## Acknowledgments | تقدیر و تشکر

### English | انگلیسی

- Dream symbol interpretations based on common psychological understandings
- Special thanks to the natural.js library for NLP capabilities

### فارسی | Persian

- تفسیرهای نماد رویا بر اساس درک‌های روانشناختی رایج
- تشکر ویژه از کتابخانه natural.js برای قابلیت‌های NLP 