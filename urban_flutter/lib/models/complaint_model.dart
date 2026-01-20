class Complaint {
  final String title;
  final String citizenName;
  final String location;
  final String imagePath;
  final int priority;

  Complaint({
    required this.title,
    required this.citizenName,
    required this.location,
    this.imagePath = "",
    this.priority = 1
  });
}