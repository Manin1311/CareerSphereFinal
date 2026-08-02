from django.contrib import admin
from api.models import (
    Company, APIKey, Session, Candidate,
    SkillTaxonomy, ChatHistory, IngestJob,
    DeveloperAccount, DeveloperAPIKey, APIUsageLog, MonthlyUsageSummary,
    BillingSubscription, JobSeekerAccount, JobApplication,
    Notification, ResumeDraft, ResumeVersion, SavedJob,
    CompanyBillingSubscription, SeekerBillingSubscription,
    SessionRound, MCQQuestion, CodingProblem,
    ApplicantRoundAttempt, SeekerMockAttempt,
    SubscriptionPlan, MarketRegionConfig, SalaryTimelineConfig,
    GrowthSkillFallback, LocationLookup, SupportTicket,
    Review, AdminBanLog, AdminAuditLog,
    GeminiProject, GeminiApiKey, AgentModelConfig, GroqApiKey,
)

# ─── Recruiter / Company ──────────────────────────────────────────────────────

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'tier', 'is_active', 'is_banned', 'created_at')
    list_filter = ('tier', 'is_active', 'is_banned')
    search_fields = ('name', 'email')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


# ─── Developer Portal ─────────────────────────────────────────────────────────

@admin.register(DeveloperAccount)
class DeveloperAccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'company_name', 'tier', 'is_verified', 'is_banned', 'created_at')
    list_filter = ('tier', 'is_verified', 'is_banned')
    search_fields = ('email', 'company_name')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(DeveloperAPIKey)
class DeveloperAPIKeyAdmin(admin.ModelAdmin):
    list_display = ('id', 'key_name', 'developer', 'environment', 'masked_public_key', 'is_active', 'created_at')
    list_filter = ('environment', 'is_active')
    search_fields = ('key_name', 'developer__email')
    readonly_fields = ('id', 'created_at', 'public_key', 'secret_key')
    ordering = ('-created_at',)

    @admin.display(description='Public Key')
    def masked_public_key(self, obj):
        k = obj.public_key or ''
        return k[:16] + '...' if len(k) > 16 else k


@admin.register(APIUsageLog)
class APIUsageLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'api_key', 'endpoint', 'action_type', 'status_code', 'latency_ms', 'timestamp')
    list_filter = ('action_type', 'status_code')
    search_fields = ('endpoint',)
    readonly_fields = ('id', 'timestamp')
    ordering = ('-timestamp',)


@admin.register(MonthlyUsageSummary)
class MonthlyUsageSummaryAdmin(admin.ModelAdmin):
    list_display = ('id', 'developer', 'year_month', 'parse_count', 'match_count', 'chat_count', 'total_api_calls')
    search_fields = ('developer__email', 'year_month')
    readonly_fields = ('id',)


# ─── API Keys (Recruiter) ─────────────────────────────────────────────────────

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'key_name', 'environment', 'masked_key', 'is_active', 'created_at')
    list_filter = ('is_active', 'environment')
    search_fields = ('company__name', 'key_name')
    readonly_fields = ('id', 'created_at', 'public_key', 'secret_key')

    @admin.display(description='Public Key')
    def masked_key(self, obj):
        k = obj.public_key or ''
        return k[:8] + '...' + k[-4:] if len(k) > 12 else '***'


# ─── Candidate / Session / Ingest ─────────────────────────────────────────────

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'name', 'job_title', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'job_title', 'company__name')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'session', 'match_score', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'session__name')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(IngestJob)
class IngestJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'type', 'status', 'total_files', 'processed_files', 'failed_files', 'created_at')
    list_filter = ('status', 'type')
    search_fields = ('session__name',)
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


# ─── Skill Taxonomy & Chat ─────────────────────────────────────────────────────

@admin.register(SkillTaxonomy)
class SkillTaxonomyAdmin(admin.ModelAdmin):
    list_display = ('id', 'canonical_name', 'skill_name', 'category', 'parent_category')
    list_filter = ('category',)
    search_fields = ('canonical_name', 'skill_name', 'category')
    ordering = ('canonical_name',)


@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'role', 'short_content', 'created_at')
    list_filter = ('role',)
    search_fields = ('session__name',)
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Content')
    def short_content(self, obj):
        return (obj.content or '')[:80] + '...' if len(obj.content or '') > 80 else obj.content


# ─── Job Seeker ───────────────────────────────────────────────────────────────

@admin.register(JobSeekerAccount)
class JobSeekerAccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'tier', 'is_active', 'is_banned', 'email_verified', 'created_at')
    list_filter = ('tier', 'is_active', 'is_banned', 'email_verified')
    search_fields = ('full_name', 'email')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'seeker', 'session', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('seeker__full_name', 'seeker__email', 'session__name')
    readonly_fields = ('id', 'applied_at')
    ordering = ('-applied_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'seeker', 'company', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')
    search_fields = ('seeker__email', 'title')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'seeker', 'session', 'saved_at')
    search_fields = ('seeker__email', 'session__name')
    readonly_fields = ('id', 'saved_at')
    ordering = ('-saved_at',)


# ─── Resume ──────────────────────────────────────────────────────────────────

@admin.register(ResumeDraft)
class ResumeDraftAdmin(admin.ModelAdmin):
    list_display = ('id', 'seeker', 'title', 'template_id', 'ats_score', 'is_active', 'created_at')
    list_filter = ('is_active', 'template_id')
    search_fields = ('seeker__email', 'title')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-updated_at',)


@admin.register(ResumeVersion)
class ResumeVersionAdmin(admin.ModelAdmin):
    list_display = ('id', 'draft', 'title', 'ats_score', 'created_at')
    search_fields = ('draft__seeker__email', 'title')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


# ─── Assessment / Interview ───────────────────────────────────────────────────

@admin.register(SessionRound)
class SessionRoundAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'round_type', 'round_number', 'name', 'is_active')
    list_filter = ('round_type', 'is_active')
    search_fields = ('session__name', 'name')
    ordering = ('session', 'round_number')


@admin.register(MCQQuestion)
class MCQQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'short_question', 'difficulty')
    list_filter = ('difficulty', 'category')
    search_fields = ('question_text', 'category')

    @admin.display(description='Question')
    def short_question(self, obj):
        return (obj.question_text or '')[:80]


@admin.register(CodingProblem)
class CodingProblemAdmin(admin.ModelAdmin):
    list_display = ('id', 'slug', 'title', 'difficulty')
    list_filter = ('difficulty',)
    search_fields = ('title', 'slug')


@admin.register(ApplicantRoundAttempt)
class ApplicantRoundAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'candidate', 'round', 'status', 'mcq_score', 'coding_score', 'interview_score', 'overall_score', 'started_at')
    list_filter = ('status',)
    search_fields = ('candidate__name', 'candidate__email')
    readonly_fields = ('id', 'started_at', 'submitted_at', 'access_token')
    ordering = ('-started_at',)


@admin.register(SeekerMockAttempt)
class SeekerMockAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'seeker', 'attempt_type', 'status', 'score', 'created_at', 'submitted_at')
    list_filter = ('attempt_type', 'status')
    search_fields = ('seeker__email',)
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


# ─── Billing ──────────────────────────────────────────────────────────────────

@admin.register(BillingSubscription)
class BillingSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'developer', 'plan', 'status', 'current_period_end', 'created_at')
    list_filter = ('plan', 'status')
    search_fields = ('developer__email',)
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(CompanyBillingSubscription)
class CompanyBillingSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'plan', 'status', 'current_period_end', 'created_at')
    list_filter = ('plan', 'status')
    search_fields = ('company__name', 'company__email')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(SeekerBillingSubscription)
class SeekerBillingSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'seeker', 'plan', 'status', 'current_period_end', 'created_at')
    list_filter = ('plan', 'status')
    search_fields = ('seeker__email', 'seeker__full_name')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


# ─── Config / Lookups ─────────────────────────────────────────────────────────

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price', 'currency', 'period', 'target_portal', 'is_active')
    list_filter = ('target_portal', 'is_active')
    search_fields = ('name',)


@admin.register(MarketRegionConfig)
class MarketRegionConfigAdmin(admin.ModelAdmin):
    list_display = ('name', 'fallback_value', 'color_hex', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(SalaryTimelineConfig)
class SalaryTimelineConfigAdmin(admin.ModelAdmin):
    list_display = ('year', 'salary_k', 'is_projection')
    list_filter = ('is_projection',)
    search_fields = ('year',)


@admin.register(GrowthSkillFallback)
class GrowthSkillFallbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'growth_percentage', 'median_salary', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(LocationLookup)
class LocationLookupAdmin(admin.ModelAdmin):
    list_display = ('id', 'country', 'state', 'created_at')
    search_fields = ('country', 'state')


# ─── Support / Reviews ────────────────────────────────────────────────────────

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'subject', 'status', 'resolved_by', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_type', 'seeker', 'rating', 'is_featured', 'created_at')
    list_filter = ('user_type', 'rating', 'is_featured')
    search_fields = ('seeker__email', 'text')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


# ─── Admin Audit / Ban Logs ───────────────────────────────────────────────────

@admin.register(AdminBanLog)
class AdminBanLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'admin_email', 'target_type', 'target_id', 'action', 'timestamp')
    list_filter = ('action', 'target_type')
    search_fields = ('admin_email',)
    readonly_fields = ('id', 'timestamp')
    ordering = ('-timestamp',)


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'admin_email', 'action', 'target_type', 'target_id', 'timestamp')
    list_filter = ('action', 'target_type')
    search_fields = ('admin_email', 'target_type')
    readonly_fields = ('id', 'timestamp')
    ordering = ('-timestamp',)


# ─── Gemini API Key Rotation & Agent Model Config ─────────────────────────────

class GeminiApiKeyInline(admin.TabularInline):
    model = GeminiApiKey
    extra = 0
    fields = ('label', 'key', 'is_active', 'created_at')
    readonly_fields = ('created_at',)


@admin.register(GeminiProject)
class GeminiProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'quota_display', 'rpm_limit', 'is_active', 'last_reset')
    list_filter = ('is_active',)
    search_fields = ('name',)
    readonly_fields = ('daily_usage', 'last_reset', 'created_at')
    inlines = [GeminiApiKeyInline]
    actions = ['reset_daily_usage', 'toggle_active']

    @admin.display(description='Quota (Used/Limit)')
    def quota_display(self, obj):
        pct = (obj.daily_usage / obj.daily_limit * 100) if obj.daily_limit > 0 else 0
        status = "🔴" if pct >= 100 else "🟡" if pct >= 75 else "🟢"
        return f"{status} {obj.daily_usage}/{obj.daily_limit} ({pct:.0f}%)"

    @admin.action(description='Reset daily usage to 0')
    def reset_daily_usage(self, request, queryset):
        queryset.update(daily_usage=0)

    @admin.action(description='Toggle active status')
    def toggle_active(self, request, queryset):
        for obj in queryset:
            obj.is_active = not obj.is_active
            obj.save(update_fields=['is_active'])


@admin.register(GeminiApiKey)
class GeminiApiKeyAdmin(admin.ModelAdmin):
    list_display = ('label', 'project', 'masked_key', 'is_active', 'created_at')
    list_filter = ('is_active', 'project')
    search_fields = ('label',)
    readonly_fields = ('created_at',)

    @admin.display(description='API Key (Masked)')
    def masked_key(self, obj):
        if len(obj.key) > 12:
            return obj.key[:8] + '...' + obj.key[-4:]
        return '***'


@admin.register(AgentModelConfig)
class AgentModelConfigAdmin(admin.ModelAdmin):
    list_display = ('agent_name', 'display_name', 'primary_provider', 'fallback_provider', 'is_active')
    list_filter = ('primary_provider', 'fallback_provider', 'is_active')
    list_editable = ('primary_provider', 'fallback_provider', 'is_active')
    search_fields = ('agent_name', 'display_name')


@admin.register(GroqApiKey)
class GroqApiKeyAdmin(admin.ModelAdmin):
    list_display = ('id', 'label', 'is_active', 'usage_count', 'last_used_at', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('label',)
    readonly_fields = ('id', 'created_at', 'encrypted_key')


# ─── Admin Site Branding ──────────────────────────────────────────────────────
admin.site.site_header = "CareerSphere Admin"
admin.site.site_title = "CareerSphere Admin Portal"
admin.site.index_title = "Welcome to CareerSphere Admin Panel"
