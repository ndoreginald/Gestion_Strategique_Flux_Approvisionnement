import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
}: DashboardCardProps) {
  return (
    <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Contenu principal */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1} color={trend.isPositive ? "success.main" : "error.main"}>
                <Typography variant="body2" fontWeight="medium">
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </Typography>
                <Icon size={16} style={{ marginLeft: 5, transform: trend.isPositive ? "none" : "rotate(180deg)" }} />
              </Box>
            )}
          </Box>

          {/* Icône */}
          <Box sx={{ bgcolor: color, p: 2, borderRadius: 2 }}>
            <Icon size={32} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
