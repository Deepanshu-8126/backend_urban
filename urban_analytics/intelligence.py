from pymongo import MongoClient

def get_real_data():
    """
    Fetch real data from your existing MongoDB collections
    """
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client.cityos
        
        # Get complaints data
        complaints = list(db.complaints.find({}, {
            "ward": 1, 
            "category": 1, 
            "priority": 1,
            "_id": 0
        }))
        
        # Get properties data  
        properties = list(db.properties.find({}, {
            "taxPaid": 1,
            "ward": 1,
            "_id": 0
        }))
        
        # Get population data (citizens collection)
        population = list(db.citizens.find({}, {
            "ward": 1,
            "age": 1,
            "_id": 0
        }))
        
        # Get disaster alerts data
        disasters = list(db.disasteralerts.find({}, {
            "severity": 1,
            "ward": 1,
            "disasterType": 1,
            "_id": 0
        }))
        
        client.close()
        return complaints, properties, population, disasters
        
    except Exception as e:
        print(f"Error fetching data from MongoDB: {e}")
        # Return empty data if error
        return [], [], [], []

def generate_city_insights(complaints, properties, population, disasters):
    """
    Generate automatic insights from real city data
    """
    insights = []
    
    # Insight 1: Complaint Hotspot Analysis
    if complaints:
        high_complaint_wards = {}
        for comp in complaints:
            ward = comp.get('ward', 'Unknown')
            if ward not in high_complaint_wards:
                high_complaint_wards[ward] = 0
            high_complaint_wards[ward] += 1
        
        for ward, count in high_complaint_wards.items():
            if count > 2:  # Reduced threshold for testing
                insights.append({
                    "type": "complaint_hotspot",
                    "ward": ward,
                    "message": f"Ward {ward} mein {count} complaints hain",
                    "recommendation": "Field team deploy karein aur root cause investigate karein"
                })
    
    # Insight 2: Property Tax Revenue Leakage
    if properties:
        total_properties = len(properties)
        tax_defaulters = sum(1 for p in properties if not p.get('taxPaid', False))
        default_rate = tax_defaulters / total_properties if total_properties > 0 else 0
        
        if default_rate > 0.2:  # 20% se zyada defaulters
            insights.append({
                "type": "revenue_leakage",
                "message": f"{tax_defaulters}/{total_properties} properties ({default_rate:.1%}) mein tax default detected",
                "recommendation": "Tax collection drive shuru karein aur property verification karein"
            })
    
    # Insight 3: High-Risk Disaster Zones
    if disasters:
        high_risk_areas = [d for d in disasters if d.get('severity') == 'high']
        if high_risk_areas:
            insights.append({
                "type": "disaster_alert",
                "message": f"{len(high_risk_areas)} high-risk disaster zones detected",
                "recommendation": "Evacuation plan activate karein aur emergency resources deploy karein"
            })
    
    # Insight 4: Population Density Stress
    if population:
        ward_population = {}
        for citizen in population:
            ward = citizen.get('ward', 'Unknown')
            if ward not in ward_population:
                ward_population[ward] = 0
            ward_population[ward] += 1
        
        for ward, pop_count in ward_population.items():
            if pop_count > 5:  # High population density
                insights.append({
                    "type": "population_stress",
                    "ward": ward,
                    "message": f"Ward {ward} mein {pop_count} registered citizens hain",
                    "recommendation": "Infrastructure capacity review karein aur public services scale up karein"
                })
    
    # Insight 5: Cross-Module Correlation
    if complaints and population:
        # Find wards with both high complaints and high population
        complaint_wards = set(comp.get('ward') for comp in complaints if comp.get('ward'))
        population_wards = set(cit.get('ward') for cit in population if cit.get('ward'))
        stressed_wards = complaint_wards.intersection(population_wards)
        
        if stressed_wards:
            insights.append({
                "type": "systemic_stress",
                "wards": list(stressed_wards),
                "message": f"Multiple wards show combined population pressure and service complaints",
                "recommendation": "Holistic urban planning approach adopt karein with integrated service delivery"
            })
    
    return insights

# Test function
if __name__ == "__main__":
    complaints, properties, population, disasters = get_real_data()
    insights = generate_city_insights(complaints, properties, population, disasters)
    
    print(f"Generated {len(insights)} insights:")
    for insight in insights:
        print(f"\n{insight['type'].upper()}:")
        print(f"Message: {insight['message']}")
        print(f"Recommendation: {insight['recommendation']}")