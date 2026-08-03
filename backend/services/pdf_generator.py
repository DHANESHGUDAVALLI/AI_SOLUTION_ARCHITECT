import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable

def generate_pdf_report(eval_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1e293b'),
        fontName='Helvetica-Bold',
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#64748b'),
        fontName='Helvetica',
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold',
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    bold_body = ParagraphStyle(
        'BoldBodyCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # Header Header Banner
    proj_name = eval_data.get('project_name', 'System Architecture Blueprint')
    domain = eval_data.get('domain', 'Enterprise Software')
    
    story.append(Paragraph(f"AI Solution Architect Report", subtitle_style))
    story.append(Paragraph(f"{proj_name}", title_style))
    story.append(Paragraph(f"<b>Domain:</b> {domain} | <b>Generated:</b> Automated AI Architecture System", body_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=8, spaceAfter=15))

    # Executive Summary & Recommended Pattern
    story.append(Paragraph("1. Executive Summary & Recommended Architecture", h2_style))
    rec_pattern = eval_data.get('recommended_pattern', 'N/A')
    pattern_desc = eval_data.get('pattern_description', '')
    exec_summary = eval_data.get('executive_summary', '')

    exec_text = f"<b>Recommended Pattern:</b> <font color='#2563eb'><b>{rec_pattern}</b></font><br/><br/>" \
                f"<b>Overview:</b> {exec_summary}<br/><br/>" \
                f"<b>Pattern Details:</b> {pattern_desc}"
    story.append(Paragraph(exec_text, body_style))
    story.append(Spacer(1, 10))

    # Recommended Tech Stack Table
    story.append(Paragraph("2. Recommended Technology Stack & Technical Justifications", h2_style))
    tech_stack = eval_data.get('tech_stack', [])
    
    table_data = [[
        Paragraph("<b>Category</b>", bold_body),
        Paragraph("<b>Technology</b>", bold_body),
        Paragraph("<b>Why This Technology?</b>", bold_body),
        Paragraph("<b>Why Not Alternatives?</b>", bold_body)
    ]]

    for item in tech_stack:
        table_data.append([
            Paragraph(f"<b>{item.get('category')}</b>", body_style),
            Paragraph(f"<font color='#0284c7'><b>{item.get('technology')}</b></font>", body_style),
            Paragraph(item.get('why_this', ''), body_style),
            Paragraph(item.get('why_not_alternatives', ''), body_style)
        ])

    tech_table = Table(table_data, colWidths=[100, 110, 165, 165])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 15))

    # Architecture Tradeoffs Comparison Table
    story.append(Paragraph("3. Architecture Trade-Off & Comparison Matrix", h2_style))
    tradeoffs = eval_data.get('tradeoff_options', [])
    
    tr_data = [[
        Paragraph("<b>Architecture Option</b>", bold_body),
        Paragraph("<b>Suitability</b>", bold_body),
        Paragraph("<b>Est. Monthly Cost</b>", bold_body),
        Paragraph("<b>Pros & Trade-offs</b>", bold_body)
    ]]

    for tr in tradeoffs:
        pros_str = "<br/>".join([f"• {p}" for p in tr.get('pros', [])])
        cons_str = "<br/>".join([f"• {c}" for c in tr.get('cons', [])])
        details = f"<b>Pros:</b><br/>{pros_str}<br/><br/><b>Cons / Tradeoffs:</b><br/>{cons_str}"
        
        tr_data.append([
            Paragraph(f"<b>{tr.get('architecture_name')}</b><br/><font color='#64748b'>{tr.get('summary')}</font>", body_style),
            Paragraph(f"<b>{tr.get('suitability_score')}/100</b>", body_style),
            Paragraph(f"<b>{tr.get('estimated_monthly_cost')}</b>", body_style),
            Paragraph(details, body_style)
        ])

    tr_table = Table(tr_data, colWidths=[140, 65, 105, 230])
    tr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(tr_table)
    story.append(Spacer(1, 15))

    # Cost Estimation Section
    story.append(Paragraph("4. Estimated Infrastructure Cost Breakdown", h2_style))
    cost_info = eval_data.get('cost_estimation', {})
    total_monthly = cost_info.get('total_monthly', 0.0)
    total_annual = cost_info.get('total_annual', 0.0)

    cost_summary = f"<b>Estimated Monthly Infra Total:</b> <font color='#16a34a'><b>${total_monthly:,.2f} USD</b></font> | " \
                   f"<b>Estimated Annual Infra Total:</b> <font color='#16a34a'><b>${total_annual:,.2f} USD</b></font>"
    story.append(Paragraph(cost_summary, body_style))
    story.append(Spacer(1, 6))

    itemized_costs = cost_info.get('itemized', [])
    cost_table_data = [[
        Paragraph("<b>Resource Category</b>", bold_body),
        Paragraph("<b>Service / Component</b>", bold_body),
        Paragraph("<b>Est. Monthly (USD)</b>", bold_body),
        Paragraph("<b>Notes / Scope</b>", bold_body)
    ]]

    for c_item in itemized_costs:
        cost_table_data.append([
            Paragraph(c_item.get('resource', ''), body_style),
            Paragraph(c_item.get('service_type', ''), body_style),
            Paragraph(f"${c_item.get('estimated_monthly_usd', 0.0):,.2f}", body_style),
            Paragraph(c_item.get('notes', ''), body_style)
        ])

    cost_table = Table(cost_table_data, colWidths=[130, 160, 90, 160])
    cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(cost_table)
    story.append(Spacer(1, 15))

    # Agile Sprint Plan
    story.append(Paragraph("5. Agile Sprint Plan & Implementation Roadmap", h2_style))
    sprints = eval_data.get('sprint_plan', [])
    
    sprint_table_data = [[
        Paragraph("<b>Sprint</b>", bold_body),
        Paragraph("<b>Focus & Deliverables</b>", bold_body),
        Paragraph("<b>Milestone</b>", bold_body)
    ]]

    for sp in sprints:
        deliv_str = "<br/>".join([f"• {d}" for d in sp.get('key_deliverables', [])])
        sprint_table_data.append([
            Paragraph(f"<b>Sprint {sp.get('sprint_number')}</b><br/>({sp.get('duration_weeks')} Weeks)", body_style),
            Paragraph(f"<b>{sp.get('sprint_title')}</b><br/>{deliv_str}", body_style),
            Paragraph(f"<font color='#059669'><b>{sp.get('milestone')}</b></font>", body_style)
        ])

    sprint_table = Table(sprint_table_data, colWidths=[90, 300, 150])
    sprint_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(sprint_table)
    story.append(Spacer(1, 15))

    # Risk Analysis Table
    story.append(Paragraph("6. Architectural Risk Matrix & Mitigation Strategies", h2_style))
    risks = eval_data.get('risk_analysis', [])
    
    risk_table_data = [[
        Paragraph("<b>Category</b>", bold_body),
        Paragraph("<b>Risk & Description</b>", bold_body),
        Paragraph("<b>Severity</b>", bold_body),
        Paragraph("<b>Mitigation Strategy</b>", bold_body)
    ]]

    for r in risks:
        sev = r.get('severity', 'Medium')
        sev_color = '#dc2626' if sev == 'High' else ('#d97706' if sev == 'Medium' else '#2563eb')
        risk_table_data.append([
            Paragraph(f"<b>{r.get('category')}</b>", body_style),
            Paragraph(f"<b>{r.get('risk_title')}</b><br/><font color='#64748b'>{r.get('description')}</font>", body_style),
            Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", body_style),
            Paragraph(r.get('mitigation_strategy', ''), body_style)
        ])

    risk_table = Table(risk_table_data, colWidths=[80, 180, 65, 215])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(risk_table)

    # Build document
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
