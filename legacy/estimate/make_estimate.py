"""Генерация сметы по проекту визуализатора кухонь в формате docx."""

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


DARK = RGBColor(0x00, 0x00, 0x00)


def set_cell_bg(cell, color_hex):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), color_hex)
    tc_pr.append(shd)


def add_para(doc, text, size=11, bold=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = DARK
    return p


def add_heading(doc, text, size=16, bold=True, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = doc.add_paragraph()
    p.alignment = align
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = DARK
    return p


def add_table(doc, headers, rows, total_row=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.autofit = True

    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = ""
        p = hdr[i].paragraphs[0]
        run = p.add_run(h)
        run.font.bold = True
        run.font.size = Pt(11)
        hdr[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_bg(hdr[i], "EEEEEE")

    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            p = cells[i].paragraphs[0]
            run = p.add_run(str(val))
            run.font.size = Pt(11)
            cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if i == len(row) - 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    if total_row:
        cells = table.add_row().cells
        for i, val in enumerate(total_row):
            cells[i].text = ""
            p = cells[i].paragraphs[0]
            run = p.add_run(str(val))
            run.font.bold = True
            run.font.size = Pt(11)
            cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_bg(cells[i], "EEEEEE")
            if i == len(row) - 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    return table


def main():
    doc = Document()

    for section in doc.sections:
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)

    # Заголовок
    add_heading(doc, "Смета на создание AI визуализатора столешниц", size=16, bold=True)
    doc.add_paragraph()

    # Описание
    add_para(
        doc,
        "На первом этапе предлагаем создать прототип, который даст понимание о "
        "целесообразности использования технологии генерации дилерами и конечными "
        "покупателями. В случае успеха (роста метрик конверсии сайта и повышением "
        "интереса дилеров к продажам) — развивать проект, а на 1-м этапе "
        "ограничиться минимальным функционалом.",
    )
    doc.add_paragraph()

    # Таблица
    rows = [
        ["Личный кабинет супер-администратора: список дилеров, начисление генераций, блокировка по IP", 16],
        ["Личный кабинет дилера: панель генерации, счётчик квот, история, заявка на докупку", 14],
        ["Публичный виджет на сайт: 3 бесплатных генерации → форма (телефон + email)", 10],
        ["Защита по IP до 3/10 штук", 10],
        ["Полный каталог текстур (180 штук) с фильтрами и админкой импорта", 18],
        ["Адаптация интерфейса под стиль сайта заказчика", 10],
        ["Деплой, мониторинг, логи", 10],
        ["Тестирование системы на ресурсах заказчика", 6],
        ["Приёмка, правки, документация для администратора", 6],
        ["Альтернативный сценарий генерации: загрузка эскиза/чертежа кухни → фотореалистичный рендер с применением выбранной текстуры столешницы из каталога", 26],
        ["Профиль компании дилера в личном кабинете: логотип, описание, услуги (монтаж, доставка, сборка), сроки, стандартные условия", 14],
        ["Шаблон коммерческого предложения с подстановкой данных дилера и параметров визуализации", 18],
        ["Генерация PDF коммерческого предложения и его отправка клиенту (скачивание + email)", 18],
        ["Тестирование расширенного функционала, правки, обновление документации", 10],
    ]
    add_table(
        doc,
        headers=["Состав работ", "Часы"],
        rows=rows,
        total_row=["Итого по этапу", 190],
    )
    doc.add_paragraph()

    # Текст про модель
    add_para(
        doc,
        "Для генерации будут использованы публичные модели, поэтому стоимость одной "
        "генерации будет 65 000 рублей за тысячу генераций. При оптимизации стоимость "
        "можно будет снизить примерно до 30–40 рублей за генерацию.",
    )
    doc.add_paragraph()

    # После фиксации
    add_para(doc, "После фиксации метрик предлагаем улучшения:")
    add_para(doc, "• снижение стоимости генераций за счёт оптимизации модели;")
    add_para(doc, "• аналитика для супер-администратора с возможностью отслеживания генераций по дилерам;")
    add_para(doc, "• добавление функционала, необходимость которого станет очевидна в процессе использования.")

    out_path = "/home/masked/projects/furniture-demo/furniture-demo/Смета_визуализатор_столешниц_v2.docx"
    doc.save(out_path)
    print(f"Сохранено: {out_path}")


if __name__ == "__main__":
    main()
