@echo off
git add -A
git commit -m "fix: stabilization of MCNA pipeline and enhanced business intelligence

- Refactored Supabase client to use per-request isolation (fixed race conditions)
- Fixed NameError and SyntaxErrors in backend-api/main.py
- Enhanced crm_b2b_agent with Business Intelligence Analyst for deeper insights
- Fixed search query cleaning logic in agent tools (MST/Name extraction)
- Resolved RLS bypass for background AI tasks using admin client"
git push origin main
echo.
echo Done! Code is now live on GitHub.
pause
