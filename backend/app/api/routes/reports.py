from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models import Component, Customer, FilterPlant, Report, ReportComponent
from ...schemas import ReportCreate, ReportListRead, ReportRead

router = APIRouter(tags=["reports"])


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

    if not payload.component_descriptions:
        raise HTTPException(status_code=400, detail="Component descriptions are required.")

    component_ids = [item.component_id for item in payload.component_descriptions]
    components = (
        db.query(Component)
        .filter(Component.filter_plant_id == filter_plant_id)
        .filter(Component.id.in_(component_ids))
        .all()
    )
    if len(components) != len(set(component_ids)):
        raise HTTPException(status_code=400, detail="Invalid component selection.")

    report = Report(customer_id=customer_id, filter_plant_id=filter_plant_id)
    db.add(report)
    db.flush()

    for item in payload.component_descriptions:
        description = item.description.strip()
        if not description:
            raise HTTPException(status_code=400, detail="Description is required.")
        db.add(
            ReportComponent(
                report_id=report.id,
                component_id=item.component_id,
                description=description,
            )
        )

    db.commit()
    db.refresh(report)
    return report
