# INVICTUS CONTROL CENTER
## Master Specification
### Version 1.0

---

# Vision

The Invictus Control Center is NOT a traditional admin dashboard.

It is the operational heart of the entire platform.

Every piece of business data, website content, consulting service, booking, training program, article, client interaction and platform configuration must be manageable from this interface.

No business content should ever require editing the source code.

Developers should only modify the application's logic and components.

Administrators should manage everything else from the Control Center.

---

# Core Principle

## 100% Dynamic Platform

Every editable element throughout the platform must be stored in Supabase.

The application only renders the data.

Nothing related to business content should be hardcoded.

Examples:

✔ Hero Titles

✔ Hero Subtitle

✔ CTA Buttons

✔ Images

✔ Logos

✔ Statistics

✔ Timeline

✔ Certifications

✔ Technologies

✔ Services

✔ Testimonials

✔ Case Studies

✔ Articles

✔ Navigation

✔ Footer

✔ FAQ

✔ SEO Metadata

✔ Languages

✔ Booking Packages

✔ Training Programs

✔ Prices

✔ Availability

Everything must be editable.

---

# Media Management

## IMPORTANT

The platform will NEVER upload media files directly.

Instead, every image, illustration, video or downloadable resource will be referenced using URLs.

Supported sources include:

Cloudinary

Supabase Storage Public URLs

AWS S3

Google Drive (public)

Dropbox

CDN URLs

Company Website

YouTube

Vimeo

Any HTTPS resource

Example

Hero Image

https://cdn.example.com/images/hero.jpg

Project Thumbnail

https://cdn.example.com/projects/project-one.webp

Training Video

https://youtu.be/example

The CMS should validate URLs before saving.

Provide live previews whenever possible.

---

# Control Center Structure

The dashboard should be divided into three major workspaces.

---

# Workspace 1
## Business Operations

Purpose:

Manage the consulting business.

Modules:

Executive Dashboard

CRM

Leads

Bookings

Discovery Sessions

Projects

Roadmaps

Milestones

Tasks

Invoices

Payments

Clients

Meetings

Reports

Notifications

Analytics

Audit Logs

---

# Workspace 2
## Content Studio

Purpose:

Manage the entire website without writing code.

Modules:

Homepage

About

Capabilities

Methodology

Case Studies

Training

Insights

Consulting

Testimonials

FAQ

Navigation

Footer

Media Library

SEO

Brand Assets

Translations

Global Components

---

# Workspace 3
## Platform Management

Purpose:

Manage the application itself.

Modules:

Users

Roles

Permissions

Authentication

Security

API Keys

Environment Settings

Languages

Theme

Email Templates

Automations

Integrations

System Logs

Backup

Restore

Maintenance Mode

---

# Executive Dashboard

This becomes the landing page after login.

Display:

Platform Health

Business KPIs

Upcoming Meetings

Today's Tasks

Recent Leads

Recent Bookings

Revenue Overview

Website Status

SEO Score

Translation Progress

Latest Published Content

Latest Drafts

Recent Payments

Client Activity

System Notifications

Quick Actions

---

# Website Builder

The website must be managed section-by-section.

Example:

Homepage

Hero

About Preview

Capabilities Preview

Case Studies Preview

Training Preview

Insights Preview

Testimonials

CTA

Footer

Each section includes:

Title

Subtitle

Content

Buttons

Visibility

Order

Animations

SEO

Background

Media URL

---

# Page Editor

Each page should contain dynamic blocks.

Every block includes:

Title

Description

Rich Text

Media URL

Call To Action

Button Label

Button URL

Visibility

Display Order

Translations

SEO

Animation

---

# Dynamic Components

Every reusable component should be manageable.

Examples:

Hero

Feature Cards

Statistics

Timeline

FAQ

Testimonials

Pricing Cards

Service Cards

Partner Logos

CTA Blocks

Everything configurable.

---

# Draft Workflow

Every editable page should support:

Draft

Preview

Published

Archived

No content should become public without publishing.

---

# Navigation Manager

Manage:

Header Menu

Footer Menu

Sidebar

Quick Links

External Links

Language Switcher

Social Links

Button Labels

Everything editable.

---

# SEO Manager

Each page should allow editing:

Title

Meta Description

Keywords

Canonical URL

Slug

OpenGraph

Twitter Cards

JSON-LD

Robots

Sitemap Visibility

---

# Brand Assets

Manage:

Logo

Logo Dark

Logo Light

Favicon

Brand Colors

Typography

Illustrations

Icons

Partner Logos

Everything URL-based.

---

# Media Library

Instead of uploads.

Store:

Media Name

Category

Description

Media URL

Thumbnail URL

Alt Text

Credits

Tags

Dimensions

Format

Usage

The system should provide:

Preview

Copy URL

Search

Filter

Categories

---

# Homepage Builder

Each homepage section should be:

Draggable

Hideable

Duplicable

Editable

Reorderable

Previewable

Publishable

---

# Case Study Manager

Each case study contains:

Client

Industry

Problem

Objectives

Discovery

Architecture

Implementation

Results

Lessons Learned

Technologies

Media URLs

Gallery URLs

Project Status

SEO

Translations

Related Services

---

# Training Manager

Programs

Modules

Curriculum

Duration

Price

Audience

Schedule

Resources

Media URLs

Registration Status

Certificates

---

# Consulting Manager

Services

Packages

Pricing

Discovery Questions

Deliverables

FAQs

Availability

Booking Rules

Media URLs

---

# Insights Manager

Articles

Categories

Tags

Featured Images (URL)

Authors

Reading Time

SEO

Draft

Publishing Schedule

Related Articles

---

# Testimonial Manager

Client Name

Role

Company

Photo URL

Review

Rating

Project

Visibility

Language

Featured

---

# Translation Manager

Supported Languages

English

French

Future-ready for additional languages.

Every field must support localization.

---

# Permissions

Role-Based Access Control

Administrator

Editor

Content Manager

Consultant

Finance

Client

Viewer

Granular permissions.

---

# Notifications

Email

In-App

System

Booking

Payments

Publishing

Security

All configurable.

---

# Website Health

Display:

Performance Score

SEO Score

Accessibility

Broken Links

Missing Translations

Unpublished Drafts

Expired Links

Outdated Articles

Inactive Services

Missing Images

System Status

---

# Search

Global search should include:

Pages

Clients

Projects

Articles

Services

Media

Testimonials

Users

Training

Bookings

Invoices

Everything searchable.

---

# Future Expansion

The architecture must support future modules without requiring redesign.

Examples:

Community

Online Courses

Marketplace

Knowledge Base

Digital Products

Subscriptions

AI Assistant

Affiliate Program

Partner Portal

Vendor Portal

Recruitment

Job Board

API Marketplace

White Label

---

# Final Objective

The Control Center should function as the operating system of the entire business.

Administrators should be able to operate, maintain, expand and evolve the platform entirely from the dashboard without requiring developer intervention.

Every business asset should be configurable.

Every piece of content should be editable.

Every media resource should be URL-based.

The platform must remain scalable, maintainable, multilingual and future-ready.