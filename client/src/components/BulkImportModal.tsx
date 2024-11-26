import React, { useState, useRef } from "react";
import {
	Upload,
	X,
	AlertCircle,
	CheckCircle,
	FileSpreadsheet,
	Download,
	AlertTriangle,
} from "lucide-react";
import Papa from "papaparse";
import { read, utils } from "xlsx";
import { User } from "../types";

interface BulkImportModalProps {
	onImport: (users: Omit<User, "_id">[]) => Promise<{
		success: { count: number; users: any[] };
		failures: {
			count: number;
			details: { rowIndex: number; data: any; error: string }[];
		};
	}>;
	onClose: () => void;
}

const BulkImportModal = ({ onImport, onClose }: BulkImportModalProps) => {
	const [dragActive, setDragActive] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<Omit<User, "_id">[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [importResult, setImportResult] = useState<{
		success?: { count: number; users: any[] };
		failures?: {
			count: number;
			details: { rowIndex: number; data: any; error: string }[];
		};
	} | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const processCSV = (file: File): Promise<any[]> => {
		return new Promise((resolve, reject) => {
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				transformHeader: (header) => header.trim().toLowerCase(),
				complete: (results) => {
					if (results.data.length === 0) {
						reject(new Error("No data found in file"));
					} else {
						resolve(results.data);
					}
				},
				error: (error: Error) => {
					reject(new Error(`Error parsing CSV: ${error.message}`));
				},
			});
		});
	};

	const processExcel = async (file: File): Promise<any[]> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = async (e) => {
				try {
					const data = e.target?.result;
					const workbook = read(data, { type: "array" });
					const sheetName = workbook.SheetNames[0];
					const worksheet = workbook.Sheets[sheetName];

					const jsonData = utils.sheet_to_json(worksheet, {
						raw: false,
						defval: "",
					});

					if (jsonData.length === 0) {
						throw new Error("No data found in file");
					}

					resolve(jsonData);
				} catch (err) {
					reject(
						err instanceof Error
							? err
							: new Error("Error processing Excel file")
					);
				}
			};

			reader.onerror = () => {
				reject(new Error("Error reading Excel file"));
			};

			reader.readAsArrayBuffer(file);
		});
	};

	const processFile = async (file: File) => {
		setIsProcessing(true);
		setError(null);
		setPreview([]);
		setImportResult(null);

		try {
			const fileExtension = file.name.split(".").pop()?.toLowerCase();
			let data: any[] = [];

			if (fileExtension === "csv") {
				data = await processCSV(file);
			} else if (["xlsx", "xls"].includes(fileExtension || "")) {
				data = await processExcel(file);
			} else {
				throw new Error(
					"Unsupported file format. Please use CSV or Excel format."
				);
			}

			const requiredFields = ["name", "handle", "phone", "level"];
			const headers = Object.keys(data[0]).map((h) => h.toLowerCase());
			const missingFields = requiredFields.filter(
				(field) => !headers.includes(field)
			);

			if (missingFields.length > 0) {
				throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
			}

			const processedData = data.map((row) => ({
				...row,
				group: row.group || 1,
			}));

			setPreview(processedData);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error occurred");
			setPreview([]);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			processFile(e.dataTransfer.files[0]);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			processFile(e.target.files[0]);
		}
	};

	const downloadFailures = () => {
		if (!importResult?.failures) return;

		const csvData = importResult.failures.details.map((detail) => ({
			Row: detail.rowIndex,
			Name: detail.data.name || "",
			Handle: detail.data.handle || "",
			Phone: detail.data.phone || "",
			Level: detail.data.level || "",
			Group: detail.data.group || "",
			Error: detail.error || "Unknown error",
		}));

		const csv = Papa.unparse(csvData);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", "failed_imports.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleSubmit = async () => {
		if (preview.length > 0) {
			setIsProcessing(true);
			try {
				const result = await onImport(preview);
				setImportResult(result);
			} catch (err) {
				if (err instanceof Error) {
					try {
						const errorData = JSON.parse(err.message);
						if (errorData.failures) {
							setImportResult({
								success: { count: 0, users: [] },
								failures: errorData.failures,
							});
							return;
						}
					} catch {
						setError(err.message);
					}
				}
				setError("Import failed");
			} finally {
				setIsProcessing(false);
			}
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
			<div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
				<div className="flex justify-between items-center mb-4 sm:mb-6">
					<h2 className="text-xl sm:text-2xl font-bold">Bulk Import Users</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
						aria-label="Close modal"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				{!importResult && (
					<div
						className={`border-2 border-dashed rounded-lg p-4 sm:p-8 mb-4 sm:mb-6 text-center ${
							dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
						}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
					>
						{isProcessing ? (
							<div className="flex flex-col items-center">
								<FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
								<p className="text-gray-600">Processing file...</p>
							</div>
						) : (
							<>
								<Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
								<p className="text-sm sm:text-base text-gray-600 mb-2">
									Drag and drop your file here, or{" "}
									<button
										onClick={() => inputRef.current?.click()}
										className="text-blue-600 hover:text-blue-800"
									>
										browse
									</button>
								</p>
								<p className="text-xs sm:text-sm text-gray-500">
									Accepts CSV or Excel files (.csv, .xlsx, .xls) with headers:
									name, handle, phone, level, group (optional)
								</p>
							</>
						)}
						<input
							ref={inputRef}
							type="file"
							accept=".csv,.xlsx,.xls"
							onChange={handleChange}
							className="hidden"
						/>
					</div>
				)}

				{error && (
					<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 rounded-lg flex items-start">
						<AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
						<div className="text-red-700 text-xs sm:text-sm whitespace-pre-line">
							{error}
						</div>
					</div>
				)}

				{importResult && (
					<div className="mb-4 sm:mb-6">
						<div className="flex flex-col space-y-4">
							{importResult.success && importResult.success.count > 0 && (
								<div className="p-4 bg-green-50 rounded-lg flex items-start">
									<CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
									<span className="text-green-700">
										Successfully imported {importResult.success.count} users
									</span>
								</div>
							)}

							{importResult.failures && importResult.failures.count > 0 && (
								<div className="p-4 bg-amber-50 rounded-lg">
									<div className="flex items-start mb-3">
										<AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" />
										<span className="text-amber-700">
											Failed to import {importResult.failures.count} users
										</span>
									</div>

									<div className="overflow-auto max-h-[40vh] rounded-lg border border-amber-200 bg-white">
										<table className="min-w-full divide-y divide-amber-200">
											<thead className="bg-amber-50">
												<tr>
													<th className="px-3 py-2 text-left text-xs font-medium text-amber-700 uppercase">
														Row
													</th>
													<th className="px-3 py-2 text-left text-xs font-medium text-amber-700 uppercase">
														Name
													</th>
													<th className="px-3 py-2 text-left text-xs font-medium text-amber-700 uppercase">
														Handle
													</th>
													<th className="px-3 py-2 text-left text-xs font-medium text-amber-700 uppercase">
														Phone
													</th>
													<th className="px-3 py-2 text-left text-xs font-medium text-amber-700 uppercase">
														Level
													</th>
													<th className="px-3 py-2 text-left text-xs font-medium text-amber-700 uppercase">
														Group
													</th>
													<th className="px-3 py-2 text-left text-xs font-medium text-amber-700 uppercase">
														Error
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-amber-200">
												{importResult.failures.details.map((failure) => (
													<tr
														key={failure.rowIndex}
														className="hover:bg-amber-50"
													>
														<td className="px-3 py-2 text-sm text-amber-900">
															{failure.rowIndex}
														</td>
														<td className="px-3 py-2 text-sm text-amber-900">
															{failure.data.name}
														</td>
														<td className="px-3 py-2 text-sm text-amber-900">
															{failure.data.handle}
														</td>
														<td className="px-3 py-2 text-sm text-amber-900">
															{failure.data.phone}
														</td>
														<td className="px-3 py-2 text-sm text-amber-900">
															{failure.data.level}
														</td>
														<td className="px-3 py-2 text-sm text-amber-900">
															{failure.data.group || "N/A"}
														</td>
														<td className="px-3 py-2 text-sm text-amber-900">
															{failure.error}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									<button
										onClick={downloadFailures}
										className="mt-3 flex items-center text-sm text-amber-700 hover:text-amber-800"
									>
										<Download className="w-4 h-4 mr-1" />
										Download Failed Records
									</button>
								</div>
							)}
						</div>
					</div>
				)}

				{preview.length > 0 && !importResult && (
					<div className="flex-1 min-h-0 mb-4 sm:mb-6">
						<div className="flex items-center mb-2 sm:mb-4">
							<CheckCircle className="w-5 h-5 text-green-500 mr-2" />
							<span className="text-sm sm:text-base text-green-700">
								{preview.length} users found
							</span>
						</div>
						<div className="overflow-auto max-h-[40vh] rounded-lg border border-gray-200">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50 sticky top-0">
									<tr>
										<th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Name
										</th>
										<th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Handle
										</th>
										<th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Phone
										</th>
										<th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Level
										</th>
										<th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Group
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{preview.map((user, index) => (
										<tr key={index} className="hover:bg-gray-50">
											<td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
												{user.name}
											</td>
											<td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
												{user.handle}
											</td>
											<td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
												{user.phone}
											</td>
											<td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
												{user.level}
											</td>
											<td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
												{user.group || 1}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				<div className="flex justify-end space-x-4 mt-auto">
					<button
						onClick={onClose}
						className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={preview.length === 0 || isProcessing}
						className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
							preview.length > 0 && !isProcessing
								? "bg-blue-600 text-white hover:bg-blue-700"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
						}`}
					>
						Import Users
					</button>
				</div>
			</div>
		</div>
	);
};

export default BulkImportModal;
