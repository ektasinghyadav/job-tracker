// Analytics Service - Business logic for application health scoring and metrics
// Calculates health scores, pipeline velocity, and generates insights

class AnalyticsService {
  constructor() {
    console.log('📊 Analytics Service initialized');
  }

  /**
   * Calculate health score for a single job application
   * Score is 0-100 based on multiple factors
   * @param {object} job - Job application data
   * @returns {object} - Health score and breakdown
   */
  calculateApplicationHealth(job) {
    console.log(`🏥 Calculating health score for ${job.company}...`);

    const daysSinceApplied = this._getDaysSince(job.dateApplied);
    let score = 100;
    let factors = [];
    let recommendation = '';

    // Factor 1: Time sensitivity (0-40 points)
    if (job.status === 'Applied') {
      if (daysSinceApplied > 14) {
        score -= 30;
        factors.push('Application aging (14+ days with no response)');
        recommendation = 'Consider sending a follow-up email';
      } else if (daysSinceApplied > 7) {
        score -= 15;
        factors.push('Application pending (7-14 days)');
        recommendation = 'Monitor for responses, prepare for potential interview';
      } else {
        factors.push('Recently applied (under 7 days)');
        recommendation = 'Continue researching company and preparing';
      }
    }

    // Factor 2: Status progression (0-30 points)
    if (job.status === 'Rejected') {
      score -= 100; // Failed application
      factors.push('Application rejected');
      recommendation = 'Review feedback, identify improvement areas';
    } else if (job.status === 'Withdrawn') {
      score -= 50;
      factors.push('Application withdrawn');
      recommendation = 'Consider reapplying with stronger profile';
    } else if (job.status === 'Interview Scheduled') {
      score += 20; // Bonus for progress
      factors.push('Interview scheduled - strong progress!');
      recommendation = 'Focus on interview preparation immediately';
    } else if (job.status === 'Offer') {
      score = 100; // Perfect score
      factors.push('Offer received - congratulations!');
      recommendation = 'Review offer details and make informed decision';
    }

    // Factor 3: Engagement level (0-20 points)
    if (!job.notes || job.notes.trim().length < 10) {
      score -= 10;
      factors.push('Low engagement (minimal notes)');
    } else {
      factors.push('Good engagement with detailed notes');
    }

    // Factor 4: Preparation level (0-10 points)
    if (!job.jobUrl || !job.jobUrl.trim()) {
      score -= 5;
      factors.push('Missing job posting link');
    }

    // Ensure score stays in 0-100 range
    score = Math.max(0, Math.min(100, score));

    // Determine health category
    let healthCategory;
    if (score >= 80) {
      healthCategory = 'excellent';
    } else if (score >= 60) {
      healthCategory = 'good';
    } else if (score >= 40) {
      healthCategory = 'needs-attention';
    } else {
      healthCategory = 'critical';
    }

    return {
      score: Math.round(score),
      category: healthCategory,
      factors,
      recommendation,
      daysSinceApplied,
      status: job.status
    };
  }

  /**
   * Calculate pipeline velocity (how fast applications move through stages)
   * @param {array} jobs - All job applications
   * @returns {object} - Velocity metrics
   */
  calculatePipelineVelocity(jobs) {
    console.log('⚡ Calculating pipeline velocity...');

    const velocity = {
      averageResponseTime: 0,
      interviewConversionRate: 0,
      offerConversionRate: 0,
      rejectionRate: 0,
      activeApplications: 0,
      staleApplications: 0 // Applied > 14 days, no response
    };

    if (jobs.length === 0) {
      return velocity;
    }

    // Response time calculation
    const responseTimes = [];
    jobs.forEach(job => {
      if (job.status !== 'Applied') {
        const days = this._getDaysSince(job.dateApplied);
        responseTimes.push(days);
      }
    });

    if (responseTimes.length > 0) {
      velocity.averageResponseTime = Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      );
    }

    // Conversion rates
    const total = jobs.length;
    const interviews = jobs.filter(j => j.status === 'Interview Scheduled').length;
    const offers = jobs.filter(j => j.status === 'Offer').length;
    const rejected = jobs.filter(j => j.status === 'Rejected').length;

    velocity.interviewConversionRate = Math.round((interviews / total) * 100);
    velocity.offerConversionRate = Math.round((offers / total) * 100);
    velocity.rejectionRate = Math.round((rejected / total) * 100);

    // Active vs stale applications
    jobs.forEach(job => {
      if (job.status === 'Applied') {
        const days = this._getDaysSince(job.dateApplied);
        if (days > 14) {
          velocity.staleApplications++;
        } else {
          velocity.activeApplications++;
        }
      }
    });

    return velocity;
  }

  /**
   * Generate insights and next actions based on all applications
   * @param {array} jobs - All job applications
   * @returns {object} - Actionable insights
   */
  generateInsights(jobs) {
    console.log('💡 Generating insights...');

    const insights = {
      topPriorities: [],
      strengths: [],
      improvements: [],
      nextActions: []
    };

    if (jobs.length === 0) {
      insights.nextActions.push('Start applying to jobs that match your skills');
      return insights;
    }

    // Analyze application health
    const healthScores = jobs.map(job => this.calculateApplicationHealth(job));
    const needsAttention = healthScores.filter(h => h.category === 'needs-attention' || h.category === 'critical');

    if (needsAttention.length > 0) {
      insights.topPriorities = needsAttention.slice(0, 3).map(health => ({
        message: `${health.status} application needs attention`,
        action: health.recommendation
      }));
    }

    // Calculate velocity metrics
    const velocity = this.calculatePipelineVelocity(jobs);

    // Strength analysis
    if (velocity.interviewConversionRate >= 20) {
      insights.strengths.push('Strong interview conversion rate - your applications stand out!');
    }
    if (velocity.offerConversionRate >= 10) {
      insights.strengths.push('Excellent offer rate - keep up the great work!');
    }

    // Improvement areas
    if (velocity.rejectionRate > 50) {
      insights.improvements.push('High rejection rate - consider refining your resume or targeting better-fit roles');
    }
    if (velocity.staleApplications > 5) {
      insights.improvements.push(`${velocity.staleApplications} stale applications - time for follow-ups`);
    }
    if (velocity.interviewConversionRate < 10 && jobs.length > 10) {
      insights.improvements.push('Low interview rate - review application quality and targeting');
    }

    // Next actions
    const upcomingInterviews = jobs.filter(j => j.status === 'Interview Scheduled');
    if (upcomingInterviews.length > 0) {
      insights.nextActions.push(`Prepare for ${upcomingInterviews.length} upcoming interview(s)`);
    }

    if (velocity.staleApplications > 0) {
      insights.nextActions.push('Send follow-up emails for aging applications');
    }

    const activeCount = jobs.filter(j => j.status === 'Applied').length;
    if (activeCount < 5) {
      insights.nextActions.push('Apply to more positions to maintain pipeline momentum');
    }

    return insights;
  }

  /**
   * Calculate offer probability based on historical data
   * @param {array} jobs - All job applications
   * @param {object} currentJob - Job to predict for
   * @returns {number} - Probability 0-100
   */
  predictOfferProbability(jobs, currentJob) {
    console.log(`🎯 Predicting offer probability for ${currentJob.company}...`);

    // Simple probabilistic model based on historical patterns
    let probability = 50; // Base probability

    const historicalOffers = jobs.filter(j => j.status === 'Offer').length;
    const totalApplied = jobs.length;

    if (totalApplied > 0) {
      const historicalRate = (historicalOffers / totalApplied) * 100;
      probability = historicalRate;
    }

    // Adjust based on current job status
    if (currentJob.status === 'Interview Scheduled') {
      probability += 30; // Significant boost
    } else if (currentJob.status === 'Applied') {
      const daysSince = this._getDaysSince(currentJob.dateApplied);
      if (daysSince < 7) {
        probability += 10; // Recent application
      }
    }

    // Adjust based on engagement
    if (currentJob.notes && currentJob.notes.length > 50) {
      probability += 5; // Well-researched application
    }

    return Math.min(100, Math.max(0, Math.round(probability)));
  }

  // Helper method: Calculate days since a date
  _getDaysSince(date) {
    const now = new Date();
    const then = new Date(date);
    const diffTime = Math.abs(now - then);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Export singleton instance
module.exports = new AnalyticsService();

// TODO: Add machine learning for better predictions
// TODO: Track response patterns by company/industry
// TODO: Add trend analysis over time