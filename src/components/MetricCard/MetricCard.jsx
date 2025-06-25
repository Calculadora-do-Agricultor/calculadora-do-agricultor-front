import React from 'react';
import styled from 'styled-components';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CardContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

const ChangeIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.isPositive ? '#10b981' : '#ef4444'};
  margin-right: 0.5rem;
`;

const ChangeDescription = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

const MetricCard = ({ title, value, change, changeDescription, icon: Icon }) => {
  const isPositive = change >= 0;
  const formattedChange = Math.abs(change).toFixed(1);
  
  return (
    <CardContainer>
      {Icon && <Icon size={20} className="mb-2" color="#64748b" />}
      <CardTitle>{title}</CardTitle>
      <CardValue>{value}</CardValue>
      {change !== undefined && (
        <CardFooter>
          <ChangeIndicator isPositive={isPositive}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {formattedChange}%
          </ChangeIndicator>
          {changeDescription && <ChangeDescription>{changeDescription}</ChangeDescription>}
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default MetricCard;