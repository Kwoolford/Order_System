"""
Configuration routes
"""
from fastapi import APIRouter
from app.schemas import TaxConfigResponse

router = APIRouter(prefix="/config", tags=["config"])

# Default tax rate (8.5%)
DEFAULT_TAX_RATE = 0.085


@router.get("/tax", response_model=TaxConfigResponse)
def get_tax_config():
    """
    Get current tax rate configuration

    Returns:
        Tax configuration
    """
    return TaxConfigResponse(
        tax_rate=DEFAULT_TAX_RATE,
        tax_rate_percent=DEFAULT_TAX_RATE * 100
    )
