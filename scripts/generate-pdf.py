#!/usr/bin/env python3
"""Generate Livio AI Dashboard Overview PDF for CEO/HR"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, HRFlowable
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Line
from reportlab.graphics import renderPDF
import os

OUTPUT_DIR = "/data/.openclaw/workspace/openclaw-dashboard/public/docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colors
PURPLE = HexColor("#a855f7")
DARK = HexColor("#0a0a1a")
DARK2 = HexColor("#0f0f2e")
GREEN = HexColor("#22c55e")
RED = HexColor("#ef4444")
AMBER = HexColor("#f59e0b")
BLUE = HexColor("#3b82f6")
LIGHT_PURPLE = HexColor("#e9d5ff")
GREY = HexColor("#6b7280")

def build_pdf():
    doc = SimpleDocTemplate(
        os.path.join(OUTPUT_DIR, "livio-ai-dashboard-overview.pdf"),
        pagesize=A4,
        rightMargin=40, leftMargin=40, topMargin=50, bottomMargin=40,
    )
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'],
        fontSize=28, textColor=PURPLE, spaceAfter=6, alignment=TA_CENTER,
        fontName='Helvetica-Bold')
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
        fontSize=12, textColor=GREY, alignment=TA_CENTER, spaceAfter=20)
    h1_style = ParagraphStyle('H1', parent=styles['Heading1'],
        fontSize=18, textColor=PURPLE, spaceBefore=20, spaceAfter=10,
        fontName='Helvetica-Bold')
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'],
        fontSize=14, textColor=HexColor("#7c3aed"), spaceBefore=14, spaceAfter=8,
        fontName='Helvetica-Bold')
    body_style = ParagraphStyle('Body', parent=styles['Normal'],
        fontSize=10, textColor=HexColor("#1f2937"), leading=14, spaceAfter=8,
        alignment=TA_JUSTIFY)
    bullet_style = ParagraphStyle('Bullet', parent=body_style,
        leftIndent=20, bulletIndent=10, spaceAfter=4)
    highlight_style = ParagraphStyle('Highlight', parent=body_style,
        fontSize=11, textColor=PURPLE, fontName='Helvetica-Bold', spaceAfter=6)
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'],
        fontSize=8, textColor=GREY, alignment=TA_CENTER)
    metric_style = ParagraphStyle('Metric', parent=styles['Normal'],
        fontSize=20, textColor=PURPLE, alignment=TA_CENTER, fontName='Helvetica-Bold')

    story = []

    # ===== COVER PAGE =====
    story.append(Spacer(1, 80))
    story.append(Paragraph("🚀", ParagraphStyle('Emoji', parent=title_style, fontSize=50)))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Livio AI Dashboard", title_style))
    story.append(Paragraph("Usage Analytics & Guardian System", ParagraphStyle('Sub', parent=title_style, fontSize=16, textColor=LIGHT_PURPLE)))
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="60%", thickness=2, color=PURPLE, spaceAfter=20))
    story.append(Paragraph("Internal Overview Document", subtitle_style))
    story.append(Paragraph("Prepared for CEO & HR Review", subtitle_style))
    story.append(Spacer(1, 30))
    story.append(Paragraph("Prepared by: Ashwin Pawar, Chief AI Officer", ParagraphStyle('Author', parent=body_style, alignment=TA_CENTER, textColor=PURPLE)))
    story.append(Paragraph("Date: May 5, 2026", ParagraphStyle('Date', parent=body_style, alignment=TA_CENTER)))
    story.append(Paragraph("Confidential — For Livio Internal Use Only", ParagraphStyle('Conf', parent=body_style, alignment=TA_CENTER, textColor=RED, fontSize=9)))
    story.append(PageBreak())

    # ===== EXECUTIVE SUMMARY =====
    story.append(Paragraph("📋 Executive Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE, spaceAfter=12))
    story.append(Paragraph(
        "Livio has deployed a comprehensive AI usage monitoring and protection system. "
        "This document outlines three key components: a <b>real-time Dashboard</b> for employee usage analytics, "
        "a <b>Watchdog agent</b> that detects 14 types of anomalies, and a <b>Fixer agent</b> that automatically "
        "resolves issues — all at <b>zero additional token cost</b>.",
        body_style))
    story.append(Spacer(1, 10))

    # Key metrics table
    data = [
        [Paragraph("<b>35</b>", metric_style), Paragraph("<b>14</b>", metric_style), Paragraph("<b>$0</b>", metric_style), Paragraph("<b>5 min</b>", metric_style)],
        [Paragraph("Employees Monitored", ParagraphStyle('Small', parent=body_style, alignment=TA_CENTER, fontSize=8)),
         Paragraph("Anomaly Types", ParagraphStyle('Small', parent=body_style, alignment=TA_CENTER, fontSize=8)),
         Paragraph("Token Cost", ParagraphStyle('Small', parent=body_style, alignment=TA_CENTER, fontSize=8)),
         Paragraph("Scan Interval", ParagraphStyle('Small', parent=body_style, alignment=TA_CENTER, fontSize=8))],
    ]
    t = Table(data, colWidths=[doc.width/4]*4)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor("#f3e8ff")),
        ('BOX', (0,0), (-1,-1), 1, PURPLE),
        ('INNERGRID', (0,0), (-1,-1), 0.5, LIGHT_PURPLE),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ===== DASHBOARD =====
    story.append(Paragraph("📊 1. OpenClaw Dashboard", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE, spaceAfter=12))
    story.append(Paragraph(
        "A web-based analytics dashboard deployed on GitHub Pages that provides real-time visibility "
        "into AI usage across all 35 Livio employees.",
        body_style))

    story.append(Paragraph("Three Views:", h2_style))
    views = [
        ("👤 My Dashboard", "Personal stats — each employee sees their own token usage, weekly hours, badge progress, and rank."),
        ("👔 HR Dashboard", "Password-protected view for HR — team-wide analytics, bar charts, employee breakdown table, cost tracking."),
        ("🏆 Leaderboard", "Gamified rankings — podium for top 3, weekly vs all-time views, power user badges."),
    ]
    for icon_title, desc in views:
        story.append(Paragraph(f"• <b>{icon_title}</b> — {desc}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Key Features:", h2_style))
    features = [
        "Real-time data — auto-refreshes every 60 seconds",
        "Gamification — badges (Beginner → Champion), streaks, rocket animation for 10hr goal",
        "Cost transparency — per-employee and company-wide token spend in dollars",
        "Mobile responsive — works on phone, tablet, and desktop",
        "Zero maintenance — static site, no server costs",
    ]
    for f in features:
        story.append(Paragraph(f"✅ {f}", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("🔗 URL: https://sweden-technologies.github.io/openclaw-dashboard/", highlight_style))
    story.append(PageBreak())

    # ===== WATCHDOG =====
    story.append(Paragraph("🛡️ 2. Watchdog Agent", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE, spaceAfter=12))
    story.append(Paragraph(
        "An automated monitoring system that scans all 39 OpenClaw workspaces every 5 minutes, "
        "detecting 14 types of anomalies across cost, behavior, and system health.",
        body_style))

    story.append(Paragraph("14 Monitored Metrics:", h2_style))

    metrics_data = [
        ["#", "Metric", "Threshold", "Severity"],
        ["1", "Workspace cost in 1 hour", "> $2.00", "🚨 Critical"],
        ["2", "Single session tokens", "> 500,000", "🚨 Critical"],
        ["3", "Daily company spend", "> $10.00", "🟡 Warning"],
        ["4", "Single session cost", "> $0.50", "🟡 Warning"],
        ["5", "Daily per-employee budget", "Configurable", "🟡 Warning"],
        ["6", "Same tool called 10+ times (loop)", "10x same args", "🚨 Critical"],
        ["7", "Consecutive tool failures", "> 5", "🟡 Warning"],
        ["8", "Idle session (no user message)", "> 30 min", "🟡 Warning"],
        ["9", "Zombie session (>2hr, <5 interactions)", "2hr / 5 int", "🟡 Warning"],
        ["10", "Heavy usage at unusual hours", "11pm-7am IST", "ℹ️ Info"],
        ["11", "User switches to expensive model", "Repeated", "🟡 Warning"],
        ["12", "VPS RAM usage", "> 85%", "🚨 Critical"],
        ["13", "VPS CPU sustained", "> 90% for 10min", "🟡 Warning"],
        ["14", "Container restarts", "> 3 in 1 hour", "🚨 Critical"],
    ]
    t = Table(metrics_data, colWidths=[25, 180, 90, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PURPLE),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('BACKGROUND', (0,1), (-1,-1), HexColor("#faf5ff")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor("#faf5ff"), white]),
        ('BOX', (0,0), (-1,-1), 1, PURPLE),
        ('INNERGRID', (0,0), (-1,-1), 0.5, LIGHT_PURPLE),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ===== FIXER =====
    story.append(Paragraph("🔧 3. Fixer Agent", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE, spaceAfter=12))
    story.append(Paragraph(
        "When the Watchdog detects an issue, the Fixer agent automatically steps in to resolve it. "
        "No human intervention needed — the entire pipeline is autonomous.",
        body_style))

    story.append(Paragraph("How It Works:", h2_style))
    pipeline = [
        "1️⃣ <b>Watchdog scans</b> — every 5 minutes, monitors all 14 metrics across 39 workspaces",
        "2️⃣ <b>Issues detected</b> — anomalies are logged with severity (critical/warning/info)",
        "3️⃣ <b>Fixer triggered</b> — automatically applies the appropriate fix based on issue type",
        "4️⃣ <b>Fix applied</b> — session compacted, paused, killed, or cleaned up",
        "5️⃣ <b>Re-scan</b> — monitor runs again to verify the fix worked",
        "6️⃣ <b>Dashboard updated</b> — status changes from ⚠️ to ✅ in real-time",
    ]
    for step in pipeline:
        story.append(Paragraph(step, bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Auto-Fix Actions:", h2_style))

    fix_data = [
        ["Issue Detected", "Fixer Action", "Approval Needed?"],
        ["Session file > 10MB", "Compact to last 50 messages", "No — automatic"],
        ["AGENTS.md > 20KB", "Trim to 6KB", "No — automatic"],
        ["Old checkpoint files", "Delete old checkpoints", "No — automatic"],
        ["Cost spike > $2/hr", "Pause workspace sessions", "No — automatic"],
        ["Tool loop detected", "Kill looping session", "No — automatic"],
        ["Idle session > 30min", "Mark as inactive", "No — automatic"],
        ["RAM > 85%", "Clear caches + cleanup", "No — automatic"],
    ]
    t = Table(fix_data, colWidths=[130, 145, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), GREEN),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), HexColor("#f0fdf4")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor("#f0fdf4"), white]),
        ('BOX', (0,0), (-1,-1), 1, GREEN),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#bbf7d0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ===== COST EFFICIENCY =====
    story.append(Paragraph("💰 4. Cost & Efficiency", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE, spaceAfter=12))

    story.append(Paragraph(
        "The entire Guardian system operates at <b>zero token cost</b>. All monitoring and fixing is done "
        "with pure Python scripts — no AI model calls are made by the Watchdog or Fixer.",
        body_style))

    cost_data = [
        ["Component", "Technology", "Token Cost", "Server Load"],
        ["Dashboard", "Next.js (static)", "$0", "None — GitHub Pages"],
        ["Watchdog Monitor", "Python script", "$0", "~2s every 5 min"],
        ["Fixer Agent", "Python script", "$0", "~1s on demand"],
        ["Data Generator", "Node.js script", "$0", "~1s every 5 min"],
        ["Total Additional Cost", "—", "$0/mo", "Negligible"],
    ]
    t = Table(cost_data, colWidths=[110, 100, 70, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BLUE),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,-1), (-1,-1), HexColor("#dbeafe")),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [HexColor("#eff6ff"), white]),
        ('BOX', (0,0), (-1,-1), 1, BLUE),
        ('INNERGRID', (0,0), (-1,-1), 0.5, HexColor("#bfdbfe")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t)

    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "The only costs are from employees using their OpenClaw agents for daily work. "
        "The Guardian system actually <b>saves money</b> by catching runaway sessions, "
        "infinite loops, and cost spikes before they escalate.",
        body_style))

    # ===== ARCHITECTURE =====
    story.append(Spacer(1, 10))
    story.append(Paragraph("🏗️ 5. Architecture Overview", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE, spaceAfter=12))

    arch_text = """
    <b>Data Flow:</b><br/><br/>
    📁 OpenClaw Sessions (39 workspaces)<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;↓ every 5 minutes<br/>
    🔍 Watchdog Monitor (Python) → detects anomalies<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;↓ if issues found<br/>
    🔧 Fixer Agent (Python) → applies fixes → re-scans<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;↓ always<br/>
    📊 Data Generator (Node.js) → usage.json + guardian.json<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;↓ pushed to<br/>
    🌐 GitHub Pages Dashboard → auto-refreshes every 10s<br/>
    """
    story.append(Paragraph(arch_text, ParagraphStyle('Arch', parent=body_style, fontSize=10, leading=16, textColor=HexColor("#374151"))))

    # ===== FOOTER =====
    story.append(Spacer(1, 40))
    story.append(HRFlowable(width="100%", thickness=1, color=GREY, spaceAfter=10))
    story.append(Paragraph("Livio AI Systems — golivio.com | Confidential — Internal Use Only", footer_style))
    story.append(Paragraph("Questions? Contact Ashwin Pawar, Chief AI Officer", footer_style))

    doc.build(story)
    print(f"✅ PDF generated: {os.path.join(OUTPUT_DIR, 'livio-ai-dashboard-overview.pdf')}")


if __name__ == "__main__":
    build_pdf()
