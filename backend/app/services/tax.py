"""
Tax calculation services
"""

# Default tax rate (8.5%)
DEFAULT_TAX_RATE = 0.085


def calculate_tax(taxable_amount: float, tax_rate: float = DEFAULT_TAX_RATE) -> float:
    """
    Calculate tax for a given amount

    Args:
        taxable_amount: Amount to calculate tax on
        tax_rate: Tax rate (default: 8.5%)

    Returns:
        Tax amount
    """
    return round(taxable_amount * tax_rate, 2)
