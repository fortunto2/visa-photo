# Разведка: Passlens (passlens.com)

Полный проход продукта в браузере 5 августа 2026. Всё ниже — наблюдение, не пересказ их
маркетинга. Скриншоты: `docs/competitor-shots/`.

Passlens — конкурент, который по ТЗ «занимает нашу позицию дословно». Проход показал, что
позиция занята не целиком: в двух местах они ломают собственное обещание, и это наш вход.

---

## 1. Что они построили

**Контентная сеть.** 122 внутренние ссылки с главной. Кластеры:

| Кластер | Примеры URL |
|---|---|
| Требования | `/passport-photo-requirements`, `/visa-photo-requirements`, `/id-photo-requirements`, `/driving-licence-photo-requirements`, `/biometric-photo-requirements`, `/work-permit-photo-requirements`, `/student-id-photo-requirements` |
| Инструменты (лендинги) | `/passport-photo-maker`, `/2x2-passport-photo-maker`, `/us-passport-photo-maker`, `/600x600-passport-photo-maker`, `/passport-photo-checker`, `/drivers-license-photo-maker` |
| Калькуляторы | `/passport-photo-mm-to-pixels-calculator`, `/passport-photo-dpi-and-pixels` |
| Печать | `/passport-photo-print-layouts`, `/passport-photo-sheet-template` |
| Long-tail ферма | `/image-tools/*` — 13 утилит: converter, shadow-remover, photo-darkener, inverter, blur, round-cropper, cropper, eyedropper, black-and-white, flipper, brightener, colorize, rotator |
| Блог | `/blog/*` — 2x2-passport-photo-size, 35x45-photo-size-guide, 50x70, pixels, и т.д. |

**Языки: 7 — en, es, fr, ar, zh-Hans, de, pt.** Через `link rel=alternate hreflang`, URL вида
`/es`, `/fr`. JSON-LD: `Organization`, `CollectionPage`, `WebApplication`, `BreadcrumbList`.

**Приложение.** 4-шаговый wizard на `/app`: Document Type → Upload Photos → Edit & Crop →
Print Layout. Пресеты сгруппированы по странам, с флагами, размером в мм и типом документа —
паспорт, национальный ID, водительские права, ВНЖ; отдельно штаты США (Ohio) и регионы
Австралии (Victoria, Western Australia). Поиск по странам, алфавитный индекс. Тёмная тема.

**Редактор.** В шапке сразу спека: `Türkiye Residence Permit · 50×60mm · 300 DPI (591×709px)`
плюс строка про фон. Одна кнопка `Auto Create Compliant Photo` — детект лица, выпрямление
наклона, кроп по спеке, удаление фона. Выбор 300/600 DPI. Экспорт: `Download exact JPEG`,
`Download exact PNG` — **бесплатно, без водяного знака, без регистрации.** Обещание держат.

**Печать.** Бумага 4×6, 5×7, A4, A5, Letter, Custom. Layout preset Auto grid. Экспорт PNG /
JPEG / PDF. Предупреждение «Print at 100% scale».

## 2. Где они ломаются — это и есть наш вход

### 2.1. Инструмента нет на контентных страницах

`/passport-photo-maker` — 1166 слов текста, `document.querySelectorAll('canvas').length === 0`,
ни одного контрола кроме языка и оглавления. `/visa-photo-requirements` — 797 слов, одна
таблица, `canvas + input[type=file] === 0`.

Страница с названием «Passport Photo **Maker**» ничего не делает. Инструмент за кнопкой
«Open app».

Путь пользователя: поиск → лендинг (800–1200 слов) → «Open app» → 4 шага wizard → модалка
выбора движка → результат. **Между вопросом «какой размер» и готовым файлом — минимум три
лишних клика.**

### 2.2. Главную кнопку перебивает технический выбор

Нажатие `Auto Create Compliant Photo` не запускает обработку. Открывается модалка
**«How to run Auto»** с тремя вариантами:

| Вариант | Ярлык | Вес |
|---|---|---|
| Standard local | Recommended · On device · Fast | ~25 МБ |
| Enhanced local | On device · Best quality | ~94 МБ |
| **Use Passlens enhanced processing** | **Online · Fastest** | «A temporary copy is sent to Passlens» |

Пользователю, который пришёл сделать фото, предлагают выбрать вес нейросети. Они сами
считают это провалом — в их же телеметрии этот момент размечен как трение:

```
en=processing_choice_prompt_open
ep.friction_bucket=mode_decision
ep.friction_surface=processing_choice_modal
ep.reason_code=processing_choice_required
ep.processing_recommendation=modnet
ep.processing_recommendation_reason=slow_connection
ep.birefnet_runtime=webgpu-512   epn.birefnet_download_mb=94
```

### 2.3. Приватность у них — режим, а не свойство

Третий вариант отправляет фото на их сервер. В телеметрии — постоянные счётчики
`server_processing_used_count`, `server_processing_api_success_count`,
`server_processing_final_image_count`, `server_processing_failure_count`, то есть серверная
обработка биометрии у них штатный, измеряемый путь, а не аварийный.

Сайт, который продаётся как «обработка локально в браузере», предлагает выгрузку снимка лица
на сервер и помечает её как **Fastest**. Формулировка мягкая — «temporary copy», «cleared
right after» — но это отправка биометрии третьей стороне.

Плюс на всех страницах Google Analytics (`G-1Y0X4W91ZE`) и собственная `/api/telemetry`,
которая шлёт события пачками.

### 2.4. Мелочь, но показательная

На 4×6 их раскладка пишет `Fits 2 (1×2) · 1 placed · 1 total` и печатает один снимок на
полупустом листе. Считает, сколько влезает, но не раскладывает.

## 3. Чего у них нет вообще

- **Русского языка.** Нет в списке hreflang.
- **Турецкого языка.** При том, что пресеты `TR Passport` и `TR Residence Permit` у них есть —
  то есть турка они обслуживают, но говорят с ним по-английски.
- Ни одной страницы с личным опытом подачи. Только спецификации и переливание текста между
  страницами кластера.

## 4. Разрыв в нашу сторону — честно

У них есть, у нас нет: **детект лица и авто-кроп**. Наш веб-кроп ручной — `cropCx`, `cropCy`,
`cropScale` двигает человек. Их `Auto` делает это за один клик, включая выпрямление наклона.
Без этого «удобнее» заявлять нельзя.

Второе: у них шире охват документов — не только виза и паспорт, но ID, права, ВНЖ, штаты
США, регионы Австралии. У нас 12 пресетов. Расширять по данным `preset_selected`, а не по
интуиции (см. ТЗ §9.3).

## 5. Что из этого следует

Копировать: структуру кластеров, спеку в шапке редактора, одну кнопку Auto, выбор бумаги при
печати, hreflang и JSON-LD, охват типов документов сверх визы.

Делать иначе — три вещи, каждая бьёт в конкретный их провал:

1. **Инструмент на самой странице страны.** Не «Open app», а рабочий редактор под спекой.
   Ноль кликов между вопросом и файлом.
2. **Ни одного вопроса про движок.** Один локальный путь, выбранный за пользователя. Их
   модалка — наш бенчмарк того, как не надо.
3. **Никакого серверного режима. Никогда.** Их «Fastest» — наша строка на каждой странице:
   снимок не покидает устройство, и код открыт, чтобы это можно было проверить.

Плюс языки, которых у них нет: русский и турецкий. Испанский — потому что доказан на
соседнем проекте (CTF 5,6 % против 2,1 % у английского на той же позиции).
