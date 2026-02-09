import json
import os

from fastapi import APIRouter, Depends, HTTPException, Response
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session
from weasyprint import HTML

from ...core.database import get_db
from ...models import (
    Customer,
    FilterPlant,
    FilterReportValue,
    FilterTestField,
    Report,
)
from ...schemas import (
    FilterReportValueRead,
    ReportCreate,
    ReportDetailRead,
    ReportListRead,
    ReportRead,
    ReportUpdate,
)

router = APIRouter(tags=["reports"])

TEMPLATE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "templates")
)
TEMPLATE_ENV = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def _format_value(value: FilterReportValueRead) -> str:
    if value.field_type == "number":
        return str(value.value_number) if value.value_number is not None else "—"
    if value.field_type == "radio":
        return value.value_option or "—"
    if value.field_type == "boolean":
        if value.value_bool is None:
            return "—"
        return "Ja" if value.value_bool else "Nein"
    return (value.value_text or "").strip() or "—"


@router.get("/reports", response_model=list[ReportListRead])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return [
        ReportListRead(
            id=report.id,
            customer_id=report.customer_id,
            customer_name=report.customer.name if report.customer else "",
            filter_plant_id=report.filter_plant_id,
            filter_plant_description=report.filter_plant.description
            if report.filter_plant
            else "",
            created_at=report.created_at,
            completed=report.completed,
        )
        for report in reports
    ]


@router.get("/reports/{report_id}", response_model=ReportDetailRead)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    return ReportDetailRead(
        id=report.id,
        customer_id=report.customer_id,
        customer_name=report.customer.name if report.customer else "",
        filter_plant_id=report.filter_plant_id,
        filter_plant_description=report.filter_plant.description if report.filter_plant else "",
        created_at=report.created_at,
        completed=report.completed,
        filter_values=[
            FilterReportValueRead(
                filter_test_field_id=value.filter_test_field_id,
                label=value.filter_test_field.label,
                field_type=value.filter_test_field.field_type,
                unit=value.filter_test_field.unit,
                options=value.filter_test_field.options,
                required=value.filter_test_field.required,
                min_value=value.filter_test_field.min_value,
                max_value=value.filter_test_field.max_value,
                value_text=value.value_text,
                value_number=value.value_number,
                value_option=value.value_option,
                value_bool=value.value_bool,
            )
            for value in report.filter_values
        ],
    )


@router.get("/reports/{report_id}/pdf")
def get_report_pdf(report_id: int, db: Session = Depends(get_db)):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    report_values = [
        FilterReportValueRead(
            filter_test_field_id=value.filter_test_field_id,
            label=value.filter_test_field.label,
            field_type=value.filter_test_field.field_type,
            unit=value.filter_test_field.unit,
            options=value.filter_test_field.options,
            required=value.filter_test_field.required,
            min_value=value.filter_test_field.min_value,
            max_value=value.filter_test_field.max_value,
            value_text=value.value_text,
            value_number=value.value_number,
            value_option=value.value_option,
            value_bool=value.value_bool,
        )
        for value in report.filter_values
    ]

    template = TEMPLATE_ENV.get_template("report.html")
    html = template.render(
        report={
            "id": report.id,
            "created_at": report.created_at,
            "completed": report.completed,
            "customer_name": report.customer.name if report.customer else "",
            "filter_plant_description": report.filter_plant.description
            if report.filter_plant
            else "",
        },
        values=[
            {
                "label": value.label,
                "unit": value.unit or "",
                "value": _format_value(value),
            }
            for value in report_values
        ],
    )

    pdf = HTML(string=html, base_url=TEMPLATE_DIR).write_pdf()
    filename = f"report_{report.id}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.get("/customers/{customer_id}/reports", response_model=list[ReportListRead])
def list_customer_reports(customer_id: int, db: Session = Depends(get_db)):
    reports = (
        db.query(Report)
        .filter(Report.customer_id == customer_id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return [
        ReportListRead(
            id=report.id,
            customer_id=report.customer_id,
            customer_name=report.customer.name if report.customer else "",
            filter_plant_id=report.filter_plant_id,
            filter_plant_description=report.filter_plant.description
            if report.filter_plant
            else "",
            created_at=report.created_at,
            completed=report.completed,
        )
        for report in reports
    ]


@router.post(
    "/customers/{customer_id}/filter-plants/{filter_plant_id}/reports",
    response_model=ReportRead,
    status_code=201,
)
def create_report(
    customer_id: int, filter_plant_id: int, payload: ReportCreate, db: Session = Depends(get_db)
):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    filter_plant = db.get(FilterPlant, filter_plant_id)
    if not filter_plant or filter_plant.customer_id != customer_id:
        raise HTTPException(status_code=404, detail="Filter plant not found.")

    if not payload.filter_values:
        raise HTTPException(status_code=400, detail="Filter values are required.")

    if not filter_plant.filter:
        raise HTTPException(status_code=400, detail="Filter is missing for filter plant.")

    fields = (
        db.query(FilterTestField)
        .filter(FilterTestField.filter_id == filter_plant.filter.id)
        .order_by(FilterTestField.id.asc())
        .all()
    )
    field_map = {field.id: field for field in fields}
    provided_ids = {item.filter_test_field_id for item in payload.filter_values}

    for field in fields:
        if field.required and field.id not in provided_ids:
            raise HTTPException(status_code=400, detail="Required filter values are missing.")

    for item in payload.filter_values:
        field = field_map.get(item.filter_test_field_id)
        if not field:
            raise HTTPException(status_code=400, detail="Invalid filter field selection.")

    report = Report(
        customer_id=customer_id, filter_plant_id=filter_plant_id, completed=False
    )
    db.add(report)
    db.flush()

    for item in payload.filter_values:
        field = field_map[item.filter_test_field_id]
        if field.field_type == "text":
            if field.required and not (item.value_text or "").strip():
                raise HTTPException(status_code=400, detail="Text value is required.")
        if field.field_type == "number":
            if field.required and item.value_number is None:
                raise HTTPException(status_code=400, detail="Number value is required.")
            if item.value_number is not None:
                if field.min_value is not None and item.value_number < field.min_value:
                    raise HTTPException(status_code=400, detail="Number value is too low.")
                if field.max_value is not None and item.value_number > field.max_value:
                    raise HTTPException(status_code=400, detail="Number value is too high.")
        if field.field_type == "radio":
            if field.required and not item.value_option:
                raise HTTPException(status_code=400, detail="Option value is required.")
            if item.value_option and field.options:
                options = json.loads(field.options)
                if item.value_option not in options:
                    raise HTTPException(status_code=400, detail="Invalid option value.")
        if field.field_type == "boolean":
            if field.required and item.value_bool is None:
                raise HTTPException(status_code=400, detail="Boolean value is required.")

        db.add(
            FilterReportValue(
                report_id=report.id,
                filter_test_field_id=item.filter_test_field_id,
                value_text=item.value_text,
                value_number=item.value_number,
                value_option=item.value_option,
                value_bool=item.value_bool,
            )
        )

    db.commit()
    db.refresh(report)
    return report


@router.patch("/reports/{report_id}", response_model=ReportDetailRead)
def update_report(report_id: int, payload: ReportUpdate, db: Session = Depends(get_db)):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    if report.completed:
        raise HTTPException(status_code=400, detail="Report is already completed.")

    if not payload.filter_values:
        raise HTTPException(status_code=400, detail="Filter values are required.")

    if not report.filter_plant or not report.filter_plant.filter:
        raise HTTPException(status_code=400, detail="Filter is missing for filter plant.")

    fields = (
        db.query(FilterTestField)
        .filter(FilterTestField.filter_id == report.filter_plant.filter.id)
        .order_by(FilterTestField.id.asc())
        .all()
    )
    field_map = {field.id: field for field in fields}
    provided_ids = {item.filter_test_field_id for item in payload.filter_values}

    for field in fields:
        if field.required and field.id not in provided_ids:
            raise HTTPException(status_code=400, detail="Required filter values are missing.")

    # Replace existing filter values
    for item in list(report.filter_values):
        db.delete(item)

    for item in payload.filter_values:
        field = field_map.get(item.filter_test_field_id)
        if not field:
            raise HTTPException(status_code=400, detail="Invalid filter field selection.")

        if field.field_type == "text":
            if field.required and not (item.value_text or "").strip():
                raise HTTPException(status_code=400, detail="Text value is required.")
        if field.field_type == "number":
            if field.required and item.value_number is None:
                raise HTTPException(status_code=400, detail="Number value is required.")
            if item.value_number is not None:
                if field.min_value is not None and item.value_number < field.min_value:
                    raise HTTPException(status_code=400, detail="Number value is too low.")
                if field.max_value is not None and item.value_number > field.max_value:
                    raise HTTPException(status_code=400, detail="Number value is too high.")
        if field.field_type == "radio":
            if field.required and not item.value_option:
                raise HTTPException(status_code=400, detail="Option value is required.")
            if item.value_option and field.options:
                options = json.loads(field.options)
                if item.value_option not in options:
                    raise HTTPException(status_code=400, detail="Invalid option value.")
        if field.field_type == "boolean":
            if field.required and item.value_bool is None:
                raise HTTPException(status_code=400, detail="Boolean value is required.")

        db.add(
            FilterReportValue(
                report_id=report.id,
                filter_test_field_id=item.filter_test_field_id,
                value_text=item.value_text,
                value_number=item.value_number,
                value_option=item.value_option,
                value_bool=item.value_bool,
            )
        )

    report.completed = payload.completed
    db.commit()
    db.refresh(report)

    return ReportDetailRead(
        id=report.id,
        customer_id=report.customer_id,
        customer_name=report.customer.name if report.customer else "",
        filter_plant_id=report.filter_plant_id,
        filter_plant_description=report.filter_plant.description
        if report.filter_plant
        else "",
        created_at=report.created_at,
        completed=report.completed,
        filter_values=[
            FilterReportValueRead(
                filter_test_field_id=value.filter_test_field_id,
                label=value.filter_test_field.label,
                field_type=value.filter_test_field.field_type,
                unit=value.filter_test_field.unit,
                options=value.filter_test_field.options,
                required=value.filter_test_field.required,
                min_value=value.filter_test_field.min_value,
                max_value=value.filter_test_field.max_value,
                value_text=value.value_text,
                value_number=value.value_number,
                value_option=value.value_option,
                value_bool=value.value_bool,
            )
            for value in report.filter_values
        ],
    )
