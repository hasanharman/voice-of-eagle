DROP VIEW IF EXISTS rumours_with_scores;

CREATE VIEW rumours_with_scores AS
SELECT 
  tr.*,
  COALESCE(cv.upvotes, 0) as upvotes,
  COALESCE(cv.downvotes, 0) as downvotes,
  COALESCE(cv.total_votes, 0) as total_community_votes,
  CASE 
    WHEN COALESCE(cv.total_votes, 0) = 0 THEN 0
    ELSE ROUND((COALESCE(cv.upvotes, 0)::float / cv.total_votes) * 100, 2)
  END as community_approval,
  COALESCE(pv.high_priority_votes, 0) as high_priority_votes,
  COALESCE(pv.medium_priority_votes, 0) as medium_priority_votes,
  COALESCE(pv.low_priority_votes, 0) as low_priority_votes,
  COALESCE(pv.total_priority_votes, 0) as total_priority_votes,
  COALESCE(pv.avg_priority_score, 0) as avg_priority_score,
  CASE 
    WHEN COALESCE(pv.avg_priority_score, 0) >= 2.5 THEN 'high'
    WHEN COALESCE(pv.avg_priority_score, 0) >= 1.5 THEN 'medium'
    ELSE 'low'
  END as calculated_priority_level
FROM transfer_rumours tr
LEFT JOIN (
  SELECT 
    rumour_id,
    SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
    SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes,
    COUNT(*) as total_votes
  FROM community_votes 
  GROUP BY rumour_id
) cv ON tr.id = cv.rumour_id
LEFT JOIN (
  SELECT 
    rumour_id,
    SUM(CASE WHEN priority_level = 'high' THEN 1 ELSE 0 END) as high_priority_votes,
    SUM(CASE WHEN priority_level = 'medium' THEN 1 ELSE 0 END) as medium_priority_votes,
    SUM(CASE WHEN priority_level = 'low' THEN 1 ELSE 0 END) as low_priority_votes,
    COUNT(*) as total_priority_votes,
    AVG(CASE 
      WHEN priority_level = 'high' THEN 3
      WHEN priority_level = 'medium' THEN 2
      WHEN priority_level = 'low' THEN 1
    END) as avg_priority_score
  FROM priority_votes 
  GROUP BY rumour_id
) pv ON tr.id = pv.rumour_id;
