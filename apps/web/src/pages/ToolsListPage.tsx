import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  Button,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { useDemoData } from '../context/DemoDataContext';
import { StatusBadge } from '../components/StatusBadge';

export const ToolsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { tools, scanStatuses, baseline } = useDemoData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Workspace Tools
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          All detected tool manifests, MCP servers, and local utilities tracked in this workspace.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter tools by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Tools Table */}
      <Paper variant="outlined" sx={{ borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>TOOL NAME</TableCell>
              <TableCell>TRUST STATUS</TableCell>
              <TableCell>PERMISSIONS</TableCell>
              <TableCell>ENDPOINT</TableCell>
              <TableCell align="right">ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTools.map(tool => {
              const status = scanStatuses.find(s => s.toolId === tool.id || s.name === tool.name);
              return (
                <TableRow
                  key={tool.id || tool.name}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tools/${tool.id || tool.name}`)}
                >
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                      {tool.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {tool.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {status && <StatusBadge status={status.status} />}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {tool.permissions && tool.permissions.length > 0 ? (
                        tool.permissions.map(p => (
                          <Chip key={p} label={p} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                        ))
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>none</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                    {tool.endpoint || 'local'}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: 'divider', color: 'text.secondary', fontSize: '0.75rem', py: 0.25 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tools/${tool.id || tool.name}`);
                      }}
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
