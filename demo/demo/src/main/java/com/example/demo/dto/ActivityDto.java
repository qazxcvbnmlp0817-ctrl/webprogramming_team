package com.example.demo.dto;

public class ActivityDto {
    private Long scopeId;
    private String scopeType;
    private String name;
    private long weeklyVisitors;
    private long newPosts;
    private long newComments;
    private double activityScore;

    public ActivityDto() {}

    public ActivityDto(Long scopeId, String scopeType, String name,
                       long weeklyVisitors, long newPosts, long newComments) {
        this.scopeId = scopeId;
        this.scopeType = scopeType;
        this.name = name;
        this.weeklyVisitors = weeklyVisitors;
        this.newPosts = newPosts;
        this.newComments = newComments;
    }

    public Long getScopeId()           { return scopeId; }
    public void setScopeId(Long v)     { this.scopeId = v; }
    public String getScopeType()       { return scopeType; }
    public void setScopeType(String v) { this.scopeType = v; }
    public String getName()            { return name; }
    public void setName(String v)      { this.name = v; }
    public long getWeeklyVisitors()    { return weeklyVisitors; }
    public void setWeeklyVisitors(long v) { this.weeklyVisitors = v; }
    public long getNewPosts()          { return newPosts; }
    public void setNewPosts(long v)    { this.newPosts = v; }
    public long getNewComments()       { return newComments; }
    public void setNewComments(long v) { this.newComments = v; }
    public double getActivityScore()   { return activityScore; }
    public void setActivityScore(double v) { this.activityScore = v; }
}
