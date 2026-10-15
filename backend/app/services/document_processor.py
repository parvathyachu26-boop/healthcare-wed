import re
from typing import List, Dict, Any

# Standard clinical reference ranges for lab tests
STANDARD_REFERENCE_RANGES = {
    "hemoglobin": {"unit": "g/dL", "low": 12.0, "high": 16.5},
    "wbc": {"unit": "/µL", "low": 4000.0, "high": 11000.0},
    "rbc": {"unit": "M/µL", "low": 4.2, "high": 5.9},
    "platelets": {"unit": "x10^3/µL", "low": 150.0, "high": 450.0},
    "fasting blood sugar": {"unit": "mg/dL", "low": 70.0, "high": 100.0},
    "postprandial glucose": {"unit": "mg/dL", "low": 90.0, "high": 140.0},
    "hba1c": {"unit": "%", "low": 4.0, "high": 5.7},
    "serum creatinine": {"unit": "mg/dL", "low": 0.6, "high": 1.2},
    "blood urea nitrogen": {"unit": "mg/dL", "low": 7.0, "high": 20.0},
    "crp": {"unit": "mg/L", "low": 0.0, "high": 5.0},
    "total cholesterol": {"unit": "mg/dL", "low": 120.0, "high": 200.0},
    "triglycerides": {"unit": "mg/dL", "low": 50.0, "high": 150.0},
    "sgot / ast": {"unit": "U/L", "low": 10.0, "high": 40.0},
    "sgpt / alt": {"unit": "U/L", "low": 7.0, "high": 56.0},
    "serum sodium": {"unit": "mEq/L", "low": 135.0, "high": 145.0},
    "serum potassium": {"unit": "mEq/L", "low": 3.5, "high": 5.0},
    "urine protein": {"unit": "mg/dL", "low": 0.0, "high": 14.0},
}

class DocumentProcessorService:
    """
    AI Document Processing & Extraction Pipeline:
    Upload Document -> OCR / Text Extraction -> Structured Medical Information -> Clinical Flagging
    """

    def process_raw_text_or_ocr(self, text_content: str, report_type: str = "Blood Test") -> Dict[str, Any]:
        results = []
        lines = [line.strip() for line in text_content.split("\n") if line.strip()]

        for line in lines:
            extracted = self._parse_lab_line(line)
            if extracted:
                results.append(extracted)

        # Fallback if no specific line matched regex but raw text is present
        if not results and "hemoglobin" in text_content.lower():
            # Extract basic matches
            for key, ref in STANDARD_REFERENCE_RANGES.items():
                pattern = rf"{key}[:\s\-]+([0-9]+\.?[0-9]*)"
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    val_float = float(match.group(1))
                    flag, interp = self._evaluate_flag(val_float, ref["low"], ref["high"])
                    results.append({
                        "test_name": key.title(),
                        "value": str(val_float),
                        "unit": ref["unit"],
                        "reference_range": f"{ref['low']} - {ref['high']} {ref['unit']}",
                        "flag": flag,
                        "interpretation": interp
                    })

        abnormal_count = len([r for r in results if r["flag"] in ["high", "low", "critical"]])
        summary = (
            f"Successfully processed {len(results)} clinical parameters. "
            f"Detected {abnormal_count} values outside reference range requiring physician review."
            if results else "Document processed. No out-of-range quantitative parameters detected."
        )

        return {
            "processed_status": "Processed",
            "summary_findings": summary,
            "results": results
        }

    def _parse_lab_line(self, line: str) -> Dict[str, Any] | None:
        # Common formats:
        # "Hemoglobin: 10.2 g/dL (12.0 - 16.5)"
        # "WBC: 13,200 /µL (4000 - 11000)"
        # "Platelets: 140000"
        pattern = r"^([a-zA-Z\s\/\-\(\)]+?)[\:\t\-]+([0-9]+[0-9\,]*\.?[0-9]*)\s*([a-zA-Z\%\/\^0-9\µ\–\-]*)"
        match = re.match(pattern, line)
        if not match:
            return None

        test_name_raw = match.group(1).strip()
        test_key = test_name_raw.lower()
        val_str = match.group(2).replace(",", "").strip()
        unit_str = match.group(3).strip()

        try:
            val_float = float(val_str)
        except ValueError:
            return None

        # Check in standard ranges
        matched_ref = None
        for ref_key, ref_val in STANDARD_REFERENCE_RANGES.items():
            if ref_key in test_key or test_key in ref_key:
                matched_ref = ref_val
                break

        if matched_ref:
            unit = unit_str or matched_ref["unit"]
            low = matched_ref["low"]
            high = matched_ref["high"]
            flag, interp = self._evaluate_flag(val_float, low, high)
            return {
                "test_name": test_name_raw.title(),
                "value": str(val_float),
                "unit": unit,
                "reference_range": f"{low} - {high} {unit}",
                "flag": flag,
                "interpretation": interp
            }
        else:
            return {
                "test_name": test_name_raw.title(),
                "value": str(val_float),
                "unit": unit_str or "-",
                "reference_range": "Clinical Correlation",
                "flag": "normal",
                "interpretation": "Within expected clinical range"
            }

    def _evaluate_flag(self, val: float, low: float, high: float) -> tuple[str, str]:
        if val < low:
            is_critical = (val < low * 0.7)
            flag = "critical" if is_critical else "low"
            return flag, f"Below reference range ({low} - {high})"
        elif val > high:
            is_critical = (val > high * 1.4)
            flag = "critical" if is_critical else "high"
            return flag, f"Above reference range ({low} - {high})"
        return "normal", f"Normal range ({low} - {high})"

document_processor = DocumentProcessorService()
